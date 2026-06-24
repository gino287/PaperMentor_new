from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..models import BoardPaper, decode_authors, encode_authors
from ..schemas import AddToBoardBody, BoardPaperOut, MoveBody

router = APIRouter()


def _to_dict(p: BoardPaper) -> dict:
    return {
        "id": p.id,
        "title": p.title,
        "authors": decode_authors(p.authors),
        "year": p.year,
        "category": p.category,
        "column": p.column,
        "sort_order": p.sort_order,
    }


def _next_sort_order(db: Session, column: str) -> int:
    result = db.query(func.max(BoardPaper.sort_order)).filter(
        BoardPaper.column == column
    ).scalar()
    return (result or -1) + 1


@router.get("")
def get_board(db: Session = Depends(get_db)):
    papers = (
        db.query(BoardPaper)
        .order_by(BoardPaper.column, BoardPaper.sort_order)
        .all()
    )
    board = {"to-read": [], "reading": [], "done": []}
    for p in papers:
        col = p.column
        if col in board:
            board[col].append(_to_dict(p))
    return board


@router.post("", status_code=201)
def add_to_board(body: AddToBoardBody, db: Session = Depends(get_db)):
    if db.get(BoardPaper, body.id):
        raise HTTPException(status_code=409, detail="Paper already on board")
    order = body.sort_order if body.sort_order is not None else _next_sort_order(db, body.column)
    paper = BoardPaper(
        id=body.id,
        title=body.title,
        authors=encode_authors(body.authors),
        year=body.year,
        category=body.category,
        column=body.column,
        sort_order=order,
    )
    db.add(paper)
    db.commit()
    db.refresh(paper)
    return _to_dict(paper)


@router.patch("/papers/{paper_id}/move")
def move_paper(paper_id: str, body: MoveBody, db: Session = Depends(get_db)):
    paper = db.get(BoardPaper, paper_id)
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    paper.column = body.column
    paper.sort_order = (
        body.sort_order if body.sort_order is not None
        else _next_sort_order(db, body.column)
    )
    db.commit()
    db.refresh(paper)
    return _to_dict(paper)


@router.delete("/papers/{paper_id}", status_code=204)
def remove_from_board(paper_id: str, db: Session = Depends(get_db)):
    paper = db.get(BoardPaper, paper_id)
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    db.delete(paper)
    db.commit()
