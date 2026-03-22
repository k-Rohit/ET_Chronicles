"""
Fetch trending topics from Economic Times homepage and trending sections.
Includes article images scraped from ET.
"""

import httpx
from bs4 import BeautifulSoup
import time

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}

ET_BASE = "https://economictimes.indiatimes.com"

SECTION_TAGS = {
    "markets": "Markets", "tech": "Tech", "startups": "Startups",
    "industry": "Industry", "economy": "Economy", "policy": "Policy",
    "banking": "Banking", "finance": "Finance", "auto": "Auto",
    "energy": "Energy", "telecom": "Telecom", "realestate": "Real Estate",
    "infrastructure": "Infrastructure", "healthcare": "Healthcare",
    "ipo": "IPO", "mutual-funds": "Mutual Funds", "commodities": "Commodities",
    "cryptocurrency": "Crypto", "politics": "Politics", "defence": "Defence",
    "environment": "Environment", "jobs": "Jobs", "small-biz": "SME", "nri": "NRI",
}


def _extract_tag_from_url(url: str) -> str:
    url_lower = url.lower()
    for key, tag in SECTION_TAGS.items():
        if f"/{key}/" in url_lower:
            return tag
    return "News"


def _find_image(element) -> str:
    """Find image URL from an element or its parent."""
    # Check inside the link itself
    img = element.find("img")
    if img:
        src = img.get("src", "") or img.get("data-src", "") or img.get("data-original", "")
        if src and "etimg.com" in src:
            # Upgrade to higher resolution
            return src.replace("width-200,height-150", "width-480,height-360")
    # Check parent container
    parent = element.parent
    if parent:
        img = parent.find("img")
        if img:
            src = img.get("src", "") or img.get("data-src", "") or img.get("data-original", "")
            if src and "etimg.com" in src:
                return src.replace("width-200,height-150", "width-480,height-360")
    return ""


async def fetch_trending_from_et() -> list[dict]:
    """Scrape ET homepage for trending/top stories with images."""
    stories = []
    seen_titles = set()

    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True, headers=HEADERS) as client:
        try:
            resp = await client.get(ET_BASE)
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "html.parser")

            for link in soup.find_all("a", href=True):
                href = link["href"]
                title = link.get_text(strip=True)

                if "/articleshow/" not in href:
                    continue
                if not title or len(title) < 15 or len(title) > 120:
                    continue

                title_key = title.lower().strip()
                if title_key in seen_titles:
                    continue
                seen_titles.add(title_key)

                if not href.startswith("http"):
                    href = ET_BASE + href

                tag = _extract_tag_from_url(href)
                image = _find_image(link)

                stories.append({
                    "id": str(len(stories) + 1),
                    "title": title,
                    "tag": tag,
                    "url": href,
                    "image": image,
                })

                if len(stories) >= 15:
                    break

        except Exception as e:
            print(f"Failed to fetch ET homepage: {e}")

        # Fallback to latest news page
        if len(stories) < 8:
            try:
                resp = await client.get(f"{ET_BASE}/news/latest-news")
                resp.raise_for_status()
                soup = BeautifulSoup(resp.text, "html.parser")

                for link in soup.find_all("a", href=True):
                    href = link["href"]
                    title = link.get_text(strip=True)

                    if "/articleshow/" not in href:
                        continue
                    if not title or len(title) < 15 or len(title) > 120:
                        continue

                    title_key = title.lower().strip()
                    if title_key in seen_titles:
                        continue
                    seen_titles.add(title_key)

                    if not href.startswith("http"):
                        href = ET_BASE + href

                    tag = _extract_tag_from_url(href)
                    image = _find_image(link)

                    stories.append({
                        "id": str(len(stories) + 1),
                        "title": title,
                        "tag": tag,
                        "url": href,
                        "image": image,
                    })

                    if len(stories) >= 15:
                        break
            except Exception as e:
                print(f"Failed to fetch ET latest news: {e}")

    return stories[:12]


# Cache
_cache: dict = {"stories": [], "timestamp": 0}
CACHE_TTL = 300  # 5 minutes


async def get_trending_stories() -> list[dict]:
    """Get trending stories with 5-minute cache."""
    now = time.time()

    if _cache["stories"] and (now - _cache["timestamp"]) < CACHE_TTL:
        return _cache["stories"]

    stories = await fetch_trending_from_et()

    if stories:
        _cache["stories"] = stories
        _cache["timestamp"] = now

    return stories
