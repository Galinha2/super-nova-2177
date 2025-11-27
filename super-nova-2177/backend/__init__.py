import sys
import os

supernova_path = os.path.join(os.path.dirname(__file__), "supernova_2177_ui_weighted")
if supernova_path not in sys.path:
    sys.path.insert(0, supernova_path)

init_file = os.path.join(supernova_path, "__init__.py")
if not os.path.exists(init_file):
    open(init_file, "a").close()

try:
    from .supernova_2177_ui_weighted.superNova_2177 import (
        register_vote, tally_votes, decide, get_threshold, 
        get_settings, DB_ENGINE_URL, SessionLocal, get_db
    )
except ImportError as e:
    print(f"Warning: Partial import failed: {e}")
    register_vote = None
    tally_votes = None
    decide = None
    get_threshold = None
    get_settings = None
    DB_ENGINE_URL = None
    SessionLocal = None
    def get_db():
        yield None

try:
    from .supernova_2177_ui_weighted.db_models import (
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