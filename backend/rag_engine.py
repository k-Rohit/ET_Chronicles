"""
RAG engine: chunking, embedding, FAISS indexing, and retrieval.
Uses OpenAI text-embedding-3-small for embeddings
and FAISS for in-memory vector search.
"""

import asyncio
import numpy as np
import faiss
from openai import OpenAI
import os

EMBEDDING_DIM = 1536  # text-embedding-3-small output dimension
EMBEDDING_MODEL = "text-embedding-3-small"

_client = None

def _get_client():
    global _client
    if _client is None:
        _client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    return _client


def _embed_texts(texts: list[str]) -> np.ndarray:
    """Embed a list of texts using OpenAI text-embedding-3-small."""
    client = _get_client()
    # OpenAI API accepts max 2048 inputs per call; batch if needed
    all_embeddings = []
    batch_size = 2048
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        response = client.embeddings.create(model=EMBEDDING_MODEL, input=batch)
        batch_embeddings = [item.embedding for item in response.data]
        all_embeddings.extend(batch_embeddings)
    embeddings = np.array(all_embeddings, dtype=np.float32)
    # Normalize for cosine similarity via inner product
    norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
    norms[norms == 0] = 1
    embeddings = embeddings / norms
    return embeddings


def chunk_article(article: dict, chunk_size: int = 250, overlap: int = 50) -> list[dict]:
    """
    Split an article into overlapping word-level chunks with metadata.
    First chunk prepends the article title for better semantic matching.
    """
    text = article.get("text", "") or article.get("summary", "")
    if not text or len(text.split()) < 20:
        return []

    title = article.get("title", "") or article.get("rss_title", "")
    url = article.get("url", "")
    source = article.get("source", "Economic Times")
    published = article.get("published", "") or article.get("publish_date", "")

    words = text.split()
    chunks = []
    start = 0

    while start < len(words):
        end = start + chunk_size
        chunk_words = words[start:end]
        chunk_text = " ".join(chunk_words)

        # Prepend title to first chunk for better matching
        if start == 0 and title:
            chunk_text = f"{title}. {chunk_text}"

        chunks.append({
            "text": chunk_text,
            "article_title": title,
            "article_url": url,
            "source": source,
            "published": published,
            "chunk_index": len(chunks),
        })

        # Move forward by (chunk_size - overlap)
        start += chunk_size - overlap
        if end >= len(words):
            break

    return chunks


def chunk_all_articles(articles: list[dict], chunk_size: int = 250, overlap: int = 50) -> list[dict]:
    """Chunk all articles and return flat list of chunks."""
    all_chunks = []
    for article in articles:
        all_chunks.extend(chunk_article(article, chunk_size, overlap))
    return all_chunks


def build_index(chunks: list[dict]) -> tuple[faiss.IndexFlatIP, np.ndarray]:
    """
    Embed all chunks and build a FAISS inner-product index.
    Uses normalized embeddings so inner product = cosine similarity.
    """
    texts = [c["text"] for c in chunks]
    embeddings = _embed_texts(texts)

    index = faiss.IndexFlatIP(EMBEDDING_DIM)
    index.add(embeddings)

    return index, embeddings


def retrieve(query: str, chunks: list[dict], index: faiss.IndexFlatIP, top_k: int = 15) -> list[dict]:
    """
    Retrieve top-k chunks most relevant to the query.
    Ensures at least 3 different source articles are represented.
    """
    query_embedding = _embed_texts([query])

    # Search more than top_k to allow for diversity enforcement
    search_k = min(top_k * 2, len(chunks))
    scores, indices = index.search(query_embedding, search_k)

    # Build candidate list with scores
    candidates = []
    for score, idx in zip(scores[0], indices[0]):
        if idx < 0 or idx >= len(chunks):
            continue
        chunk = chunks[idx].copy()
        chunk["score"] = float(score)
        candidates.append(chunk)

    # Ensure diversity: at least 3 different source articles
    selected = []
    article_urls = set()

    # First pass: take top-k greedily
    for c in candidates[:top_k]:
        selected.append(c)
        article_urls.add(c["article_url"])

    # If fewer than 3 articles represented, pull in top chunks from other articles
    if len(article_urls) < 3:
        for c in candidates[top_k:]:
            if c["article_url"] not in article_urls:
                selected.append(c)
                article_urls.add(c["article_url"])
                if len(article_urls) >= 3:
                    break

    # Sort final selection by score descending
    selected.sort(key=lambda c: c["score"], reverse=True)
    return selected[:top_k]


def _recency_boost(published: str) -> float:
    """
    Calculate a recency boost (0.0 to 0.15) based on how recent the article is.
    Articles from today get max boost, decaying over 7 days.
    """
    if not published:
        return 0.0
    try:
        from datetime import datetime, timezone
        pub_str = published.strip()
        for fmt in [
            "%Y-%m-%dT%H:%M:%S%z",
            "%Y-%m-%dT%H:%M:%S.%f%z",
            "%Y-%m-%dT%H:%M:%S",
            "%Y-%m-%d",
        ]:
            try:
                pub_date = datetime.strptime(pub_str[:len(pub_str)], fmt)
                if pub_date.tzinfo is None:
                    pub_date = pub_date.replace(tzinfo=timezone.utc)
                break
            except ValueError:
                continue
        else:
            return 0.0

        now = datetime.now(timezone.utc)
        age_hours = max(0, (now - pub_date).total_seconds() / 3600)
        boost = max(0.0, 0.15 * (1.0 - age_hours / 168))
        return boost
    except Exception:
        return 0.0


def semantic_rank(query: str, candidates: list[dict], title_key: str = "title", top_k: int = 15) -> list[dict]:
    """
    Rank search result candidates by semantic similarity to the query,
    with a recency boost for newer articles.
    """
    if not candidates:
        return []

    titles = [c.get(title_key, "") for c in candidates]
    query_emb = _embed_texts([query])
    title_embs = _embed_texts(titles)

    # Cosine similarity (dot product on normalized vectors)
    scores = np.dot(title_embs, query_emb.T).flatten()

    for i, c in enumerate(candidates):
        sem_score = float(scores[i])
        recency = _recency_boost(c.get("published", ""))
        c["_semantic_score"] = sem_score + recency
        c["_sem_raw"] = sem_score
        c["_recency_boost"] = recency

    ranked = sorted(candidates, key=lambda c: c["_semantic_score"], reverse=True)
    return ranked[:top_k]


async def rag_pipeline(query: str, articles: list[dict], top_k: int = 15) -> tuple[list[dict], list[dict], faiss.IndexFlatIP]:
    """
    Full RAG pipeline: chunk → embed → index → retrieve.
    Returns (retrieved_chunks, all_chunks, faiss_index) so the index can be cached for chat.
    Runs embedding in a thread pool since it's I/O-bound.
    """
    all_chunks = chunk_all_articles(articles)

    if not all_chunks:
        return [], [], None

    index, _ = await asyncio.to_thread(build_index, all_chunks)
    retrieved = await asyncio.to_thread(retrieve, query, all_chunks, index, top_k)

    return retrieved, all_chunks, index
