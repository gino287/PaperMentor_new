from pydantic import BaseModel
from typing import Literal
from datetime import datetime


class PaperIn(BaseModel):
    id: str
    title: str
    authors: list[str]
    year: int | None = None
    category: str | None = None


class PaperOut(BaseModel):
    id: str
    title: str
    authors: list[str]
    year: int | None
    category: str | None


class BoardPaperOut(PaperOut):
    column: str
    sort_order: int


class MoveBody(BaseModel):
    column: Literal["to-read", "reading", "done"]
    sort_order: int | None = None


class AddToBoardBody(PaperIn):
    column: Literal["to-read", "reading", "done"] = "to-read"
    sort_order: int | None = None


class SavedPaperOut(PaperOut):
    saved_at: datetime


class SavedListOut(BaseModel):
    papers: list[SavedPaperOut]
    total: int
