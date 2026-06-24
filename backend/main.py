from contextlib import asynccontextmanager
import pathlib

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from .database import engine
from .models import Base
from .routers import board, saved
from . import seed


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    seed.seed_if_empty()
    yield


app = FastAPI(title="PaperMentor API", lifespan=lifespan)

app.include_router(board.router, prefix="/api/board", tags=["board"])
app.include_router(saved.router, prefix="/api/saved", tags=["saved"])

FRONTEND = pathlib.Path(__file__).parent.parent / "frontend"
app.mount("/", StaticFiles(directory=str(FRONTEND), html=True), name="frontend")
