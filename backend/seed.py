import json
from datetime import datetime, timezone

from .database import SessionLocal
from .models import BoardPaper, SavedPaper

SEED_BOARD = [
    {"id": "p1", "title": "Mamba: Linear-Time Sequence Modeling with Selective State Spaces", "authors": ["Gu", "Dao"], "year": 2023, "category": "cs.LG", "column": "to-read", "sort_order": 0},
    {"id": "p2", "title": "Constitutional AI: Harmlessness from AI Feedback", "authors": ["Bai", "Jones", "Ndousse"], "year": 2022, "category": "cs.AI", "column": "to-read", "sort_order": 1},
    {"id": "p3", "title": "Mixtral of Experts", "authors": ["Jiang", "Sablayrolles", "Mensch"], "year": 2024, "category": "cs.LG", "column": "to-read", "sort_order": 2},
    {"id": "p4", "title": "Scaling Laws for Neural Language Models", "authors": ["Kaplan", "McCandlish", "Henighan"], "year": 2020, "category": "cs.LG", "column": "reading", "sort_order": 0},
    {"id": "p5", "title": "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models", "authors": ["Wei", "Wang", "Schuurmans"], "year": 2022, "category": "cs.AI", "column": "reading", "sort_order": 1},
    {"id": "p6", "title": "Attention Is All You Need", "authors": ["Vaswani", "Shazeer", "Parmar"], "year": 2017, "category": "cs.CL", "column": "done", "sort_order": 0},
    {"id": "p7", "title": "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding", "authors": ["Devlin", "Chang", "Lee"], "year": 2018, "category": "cs.CL", "column": "done", "sort_order": 1},
    {"id": "p8", "title": "Language Models are Few-Shot Learners", "authors": ["Brown", "Mann", "Ryder"], "year": 2020, "category": "cs.LG", "column": "done", "sort_order": 2},
]

SEED_SAVED = [
    {"id": "s1", "title": "Tree of Thoughts: Deliberate Problem Solving with Large Language Models", "authors": ["Yao", "Yu", "Zhao"], "year": 2023, "category": "cs.AI"},
    {"id": "s2", "title": "Reflexion: Language Agents with Verbal Reinforcement Learning", "authors": ["Shinn", "Cassano"], "year": 2023, "category": "cs.AI"},
    {"id": "s3", "title": "LoRA: Low-Rank Adaptation of Large Language Models", "authors": ["Hu", "Shen", "Wallis"], "year": 2021, "category": "cs.LG"},
    {"id": "s4", "title": "Self-Consistency Improves Chain of Thought Reasoning in Language Models", "authors": ["Wang", "Wei", "Schuurmans"], "year": 2022, "category": "cs.CL"},
    {"id": "s5", "title": "Large Language Models are Zero-Shot Reasoners", "authors": ["Kojima", "Gu", "Reid"], "year": 2022, "category": "cs.CL"},
    {"id": "s6", "title": "Emergent Abilities of Large Language Models", "authors": ["Wei", "Tay", "Bommasani"], "year": 2022, "category": "cs.CL"},
    {"id": "s7", "title": "Denoising Diffusion Probabilistic Models", "authors": ["Ho", "Jain", "Abbeel"], "year": 2020, "category": "cs.LG"},
    {"id": "s8", "title": "Score-Based Generative Modeling through Stochastic Differential Equations", "authors": ["Song", "Sohl-Dickstein"], "year": 2021, "category": "cs.LG"},
    {"id": "s9", "title": "In-Context Learning through the Bayesian Prism", "authors": ["Xie", "Raghunathan", "Liang"], "year": 2021, "category": "cs.LG"},
    {"id": "s10", "title": "Measuring and Narrowing the Compositionality Gap in Language Models", "authors": ["Press", "Zhang", "Min"], "year": 2022, "category": "cs.CL"},
    {"id": "s11", "title": "Toolformer: Language Models Can Teach Themselves to Use Tools", "authors": ["Schick", "Dwivedi-Yu"], "year": 2023, "category": "cs.CL"},
    {"id": "s12", "title": "Direct Preference Optimization: Your Language Model is Secretly a Reward Model", "authors": ["Rafailov", "Sharma"], "year": 2023, "category": "cs.LG"},
]


def seed_if_empty():
    db = SessionLocal()
    try:
        if db.query(BoardPaper).count() > 0:
            return
        now = datetime.now(timezone.utc)
        for data in SEED_BOARD:
            db.add(BoardPaper(
                id=data["id"],
                title=data["title"],
                authors=json.dumps(data["authors"]),
                year=data["year"],
                category=data["category"],
                column=data["column"],
                sort_order=data["sort_order"],
            ))
        for i, data in enumerate(SEED_SAVED):
            db.add(SavedPaper(
                id=data["id"],
                title=data["title"],
                authors=json.dumps(data["authors"]),
                year=data["year"],
                category=data["category"],
                saved_at=now,
            ))
        db.commit()
    finally:
        db.close()
