from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timezone

from ..database import get_db
from ..models import BoardPaper, SavedPaper, decode_authors, encode_authors
from ..schemas import PaperIn

router = APIRouter()


def _to_dict(p: SavedPaper) -> dict:
    return {
        "id": p.id,
        "title": p.title,
        "authors": decode_authors(p.authors),
        "year": p.year,
        "category": p.category,
        "saved_at": p.saved_at.isoformat(),
    }


def _next_board_order(db: Session, column: str) -> int:
    result = db.query(func.max(BoardPaper.sort_order)).filter(
        BoardPaper.column == column
    ).scalar()
    return (result or -1) + 1


@router.get("")
def get_saved(db: Session = Depends(get_db)):
    papers = (
        db.query(SavedPaper)
        .order_by(SavedPaper.saved_at.desc())
        .all()
    )
    items = [_to_dict(p) for p in papers]
    return {"papers": items, "total": len(items)}


# NOTE: this route must be registered BEFORE /{paper_id} to avoid shadowing
@router.post("/add-all-to-board")
def add_all_to_board(db: Session = Depends(get_db)):
    saved = db.query(SavedPaper).order_by(SavedPaper.saved_at).all()
    added = 0
    skipped = 0
    for p in saved:
        if db.get(BoardPaper, p.id):
            skipped += 1
            continue
        order = _next_board_order(db, "to-read")
        board_paper = BoardPaper(
            id=p.id,
            title=p.title,
            authors=p.authors,
            year=p.year,
            category=p.category,
            column="to-read",
            sort_order=order,
        )
        db.add(board_paper)
        added += 1
    db.commit()
    return {"added": added, "skipped": skipped}


@router.post("", status_code=201)
def save_paper(body: PaperIn, db: Session = Depends(get_db)):
    if db.get(SavedPaper, body.id):
        raise HTTPException(status_code=409, detail="Paper already saved")
    paper = SavedPaper(
        id=body.id,
        title=body.title,
        authors=encode_authors(body.authors),
        year=body.year,
        category=body.category,
        saved_at=datetime.now(timezone.utc),
    )
    db.add(paper)
    db.commit()
    db.refresh(paper)
    return _to_dict(paper)


@router.delete("/{paper_id}", status_code=204)
def remove_saved(paper_id: str, db: Session = Depends(get_db)):
    paper = db.get(SavedPaper, paper_id)
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    db.delete(paper)
    db.commit()
