try:
    from .supernova_2177 import (
        register_vote, tally_votes, decide, get_threshold, 
        get_settings, DB_ENGINE_URL
    )
except ImportError as e:
    print(f"Warning: Partial import failed: {e}")
    register_vote = None
    tally_votes = None
    decide = None
    get_threshold = None
    get_settings = None
    DB_ENGINE_URL = None

try:
    from .supernova_2177 import SessionLocal, get_db
except ImportError:
    print("Warning: SessionLocal not available, using fallback")
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    
    DATABASE_URL = "sqlite:///fallback.db"
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    def get_db():
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()

try:
    from .db_models import (
        Proposal, ProposalVote, Comment, Decision, Run,
        Harmonizer, VibeNode, SystemState
    )
except ImportError as e:
    print(f"Warning: Could not import db_models: {e}")

    Proposal = None
    ProposalVote = None
    Comment = None
    Decision = None
    Run = None
    Harmonizer = None
    VibeNode = None
    SystemState = None

__all__ = [
    "SessionLocal", "get_db",
    "register_vote", "tally_votes", "decide", "get_threshold",
    "get_settings", "DB_ENGINE_URL",
    "Proposal", "ProposalVote", "Comment", "Decision", "Run",
    "Harmonizer", "VibeNode", "SystemState"
]