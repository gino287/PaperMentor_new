import xml.etree.ElementTree as ET
import requests
from fastapi import APIRouter, HTTPException, Query

router = APIRouter()

ARXIV_API = "https://export.arxiv.org/api/query"
NS = {
    "atom": "http://www.w3.org/2005/Atom",
    "arxiv": "http://arxiv.org/schemas/atom",
}


def _parse_entry(entry) -> dict:
    def text(tag, ns_key="atom"):
        el = entry.find(f"{ns_key}:{tag}", NS)
        return el.text.strip() if el is not None and el.text else None

    raw_id = text("id") or ""
    arxiv_id = raw_id.split("/abs/")[-1].split("v")[0] if "/abs/" in raw_id else raw_id

    authors = [
        a.find("atom:name", NS).text.strip()
        for a in entry.findall("atom:author", NS)
        if a.find("atom:name", NS) is not None
    ]

    published = text("published") or ""
    year = int(published[:4]) if published else None

    categories = entry.findall("atom:category", NS)
    category = categories[0].get("term") if categories else None

    title_el = entry.find("atom:title", NS)
    title = " ".join((title_el.text or "").split()) if title_el is not None else ""

    return {
        "id": arxiv_id,
        "title": title,
        "authors": [a.split()[-1] for a in authors],  # last names only, matching design
        "authors_full": authors,
        "year": year,
        "category": category,
    }


@router.get("/search")
def search_papers(
    q: str = Query(..., min_length=1, description="Search query"),
    max_results: int = Query(10, ge=1, le=25),
):
    params = {
        "search_query": f"all:{q}",
        "max_results": max_results,
        "sortBy": "relevance",
        "sortOrder": "descending",
    }
    try:
        resp = requests.get(ARXIV_API, params=params, timeout=10)
        resp.raise_for_status()
    except requests.Timeout:
        raise HTTPException(status_code=504, detail="arXiv API timeout")
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"arXiv API error: {str(e)}")

    root = ET.fromstring(resp.content)
    entries = root.findall("atom:entry", NS)
    results = [_parse_entry(e) for e in entries]

    return {"results": results, "total": len(results), "query": q}
