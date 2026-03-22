"""
News scraping layer: Direct Economic Times scraping.
Uses ET's search page for article discovery, then extracts content via JSON-LD.
"""

import json
import httpx
from bs4 import BeautifulSoup
from urllib.parse import quote
import asyncio
from typing import Optional
import re


HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.google.com/",
}

ET_BASE = "https://economictimes.indiatimes.com"


async def fetch_et_search(query: str, num_results: int = 12) -> list[dict]:
    """Search ET via their search page and extract article links."""
    encoded_query = quote(query)
    search_url = f"{ET_BASE}/searchresult.cms?query={encoded_query}"

    articles = []
    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True, headers=HEADERS) as client:
            resp = await client.get(search_url)
            resp.raise_for_status()

        soup = BeautifulSoup(resp.text, "html.parser")

        seen_urls = set()
        for link in soup.find_all("a", href=True):
            href = link["href"]
            title = link.get_text(strip=True)

            if not title or len(title) < 20:
                continue
            if "/articleshow/" not in href:
                continue
            if not href.startswith("http"):
                href = ET_BASE + href
            if "economictimes.indiatimes.com" not in href:
                continue
            if href in seen_urls:
                continue
            seen_urls.add(href)

            articles.append({
                "title": title,
                "link": href,
                "published": "",
                "source": "Economic Times",
            })

            if len(articles) >= num_results:
                break

    except Exception as e:
        print(f"ET search failed: {e}")

    return articles


async def extract_article_content(url: str) -> Optional[dict]:
    """Extract article content from ET using JSON-LD structured data."""
    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True, headers=HEADERS) as client:
            resp = await client.get(url)
            resp.raise_for_status()

        soup = BeautifulSoup(resp.text, "html.parser")

        # Primary method: JSON-LD structured data (most reliable for ET)
        article_body = ""
        title = ""
        publish_date = ""
        description = ""

        for script in soup.find_all("script", type="application/ld+json"):
            try:
                data = json.loads(script.string)
                items = data if isinstance(data, list) else [data]
                for item in items:
                    if isinstance(item, dict):
                        if item.get("articleBody"):
                            article_body = item["articleBody"]
                            title = title or item.get("headline", "")
                            publish_date = publish_date or item.get("datePublished", "")
                            description = description or item.get("description", "")
            except (json.JSONDecodeError, TypeError):
                continue

        # Fallback: try HTML selectors
        if not article_body:
            for selector in ["div.artText", "div.article_content", "div.Normal", "article"]:
                container = soup.select_one(selector)
                if container:
                    for tag in container.find_all(["script", "style", "aside", "iframe"]):
                        tag.decompose()
                    paragraphs = container.find_all("p")
                    if paragraphs:
                        article_body = "\n\n".join(
                            p.get_text(strip=True) for p in paragraphs if len(p.get_text(strip=True)) > 20
                        )
                    if len(article_body) > 100:
                        break

        # Title fallback
        if not title:
            h1 = soup.find("h1")
            if h1:
                title = h1.get_text(strip=True)
            if not title:
                og = soup.find("meta", property="og:title")
                title = og["content"] if og and og.get("content") else ""

        # Date fallback
        if not publish_date:
            meta = soup.find("meta", property="article:published_time")
            if meta:
                publish_date = meta.get("content", "")

        # Description fallback
        if not description:
            meta = soup.find("meta", property="og:description") or soup.find("meta", attrs={"name": "description"})
            if meta:
                description = meta.get("content", "")

        summary = description or (article_body[:300] + "..." if len(article_body) > 300 else article_body)

        return {
            "url": url,
            "title": title,
            "text": article_body,
            "publish_date": publish_date,
            "summary": summary,
            "source": "Economic Times",
        }
    except Exception as e:
        print(f"Failed to extract article from {url}: {e}")
        return None


async def search_and_extract(query: str, max_articles: int = 8) -> list[dict]:
    """
    Full pipeline: search ET for articles, then extract content via JSON-LD.
    """
    search_results = await fetch_et_search(query, num_results=max_articles + 5)

    if not search_results:
        return []

    # Extract articles concurrently
    tasks = [extract_article_content(r["link"]) for r in search_results[:max_articles + 3]]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    articles = []
    for i, result in enumerate(results):
        if isinstance(result, dict) and result.get("text") and len(result["text"]) > 50:
            result["rss_title"] = search_results[i]["title"]
            result["published"] = search_results[i].get("published", "") or result.get("publish_date", "")
            articles.append(result)

    # If still too few, include articles with at least a title
    if len(articles) < 2:
        for i, result in enumerate(results):
            if isinstance(result, dict) and result not in articles:
                result["rss_title"] = search_results[i]["title"]
                result["published"] = search_results[i].get("published", "")
                if not result.get("text") or len(result.get("text", "")) < 50:
                    result["text"] = result.get("summary", "") or search_results[i]["title"]
                articles.append(result)
            if len(articles) >= max_articles:
                break

    return articles[:max_articles]
