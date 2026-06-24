import json
from sqlalchemy import String, Integer, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime, timezone

from .database import Base


def encode_authors(authors: list[str]) -> str:
    return json.dumps(authors, ensure_ascii=False)


def decode_authors(authors_json: str) -> list[str]:
    return json.loads(authors_json)


class BoardPaper(Base):
    __tablename__ = "board_papers"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    authors: Mapped[str] = mapped_column(Text, nullable=False)  # JSON list
    year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    category: Mapped[str | None] = mapped_column(String(32), nullable=True)
    column: Mapped[str] = mapped_column(String(16), nullable=False, default="to-read")
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)


class SavedPaper(Base):
    __tablename__ = "saved_papers"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    authors: Mapped[str] = mapped_column(Text, nullable=False)  # JSON list
    year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    category: Mapped[str | None] = mapped_column(String(32), nullable=True)
    saved_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )
