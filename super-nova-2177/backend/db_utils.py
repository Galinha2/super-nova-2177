from supernova_2177_ui_weighted.db_models import ProposalVote, Harmonizer
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
import os

DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://postgres:example@db:5432/postgres")
engine = create_engine(DATABASE_URL, future=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

SUPER_NOVA_AVAILABLE = True  # ou False conforme detecção

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()