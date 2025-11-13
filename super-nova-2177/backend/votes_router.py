


import logging
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.db_utils import get_db

try:
    from supernova_2177_ui_weighted.db_models import ProposalVote
except ImportError:
    ProposalVote = None

from pydantic import BaseModel

router = APIRouter()

class VoteIn(BaseModel):
    proposal_id: int
    voter: str  # username
    choice: str
    voter_type: str

@router.post("/votes")
def add_vote(v: VoteIn, db: Session = Depends(get_db)):
    logger = logging.getLogger("votes_router")
    try:
        logger.info(f"Received vote: {v}")
        # Remove any existing vote for this proposal_id and voter (string, not relationship)
        existing_vote = db.query(ProposalVote).filter(
            ProposalVote.proposal_id == v.proposal_id,
            ProposalVote.voter == v.voter
        ).first()
        if existing_vote:
            logger.info(f"Updating existing vote for proposal {v.proposal_id} and voter {v.voter}")
            if hasattr(existing_vote, "choice"):
                existing_vote.choice = v.choice
            if hasattr(existing_vote, "vote"):
                existing_vote.vote = v.choice
            existing_vote.voter_type = v.voter_type
        else:
            logger.info(f"Adding new vote for proposal {v.proposal_id} and voter {v.voter}")
            vote_kwargs = {
                "proposal_id": v.proposal_id,
                "voter": v.voter,
                "voter_type": v.voter_type,
            }
            if hasattr(ProposalVote, "choice"):
                vote_kwargs["choice"] = v.choice
            if hasattr(ProposalVote, "vote"):
                vote_kwargs["vote"] = v.choice
            vote = ProposalVote(**vote_kwargs)
            db.add(vote)
        db.commit()
        logger.info("Vote registered successfully")
        return {"ok": True}
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        logger.exception(f"Failed to register vote: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to register vote: {str(e)}")

@router.delete("/votes")
def remove_vote(proposal_id: int, voter: str, db: Session = Depends(get_db)):
    logger = logging.getLogger("votes_router")
    try:
        logger.info(f"Removing vote for proposal {proposal_id} and voter {voter}")
        deleted_count = db.query(ProposalVote).filter(
            ProposalVote.proposal_id == proposal_id,
            ProposalVote.voter == voter
        ).delete()
        db.commit()
        if deleted_count == 0:
            logger.warning(f"No vote found to remove for proposal {proposal_id} and voter {voter}")
            raise HTTPException(status_code=404, detail="Vote not found")
        logger.info(f"Removed {deleted_count} vote(s)")
        return {"ok": True, "removed": deleted_count}
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        logger.exception(f"Failed to remove vote: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to remove vote: {str(e)}")