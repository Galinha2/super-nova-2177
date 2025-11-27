
# --- Garantir que o diretório backend está no sys.path ---
import sys
import os
backend_path = os.path.dirname(__file__)
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)


# --- Adicionar supernova_2177_ui_weighted ao sys.path e garantir __init__.py ---
import sys
import os

# Adicionar supernova_2177_ui_weighted ao sys.path e garantir __init__.py
supernova_path = os.path.join(os.path.dirname(__file__), "supernova_2177_ui_weighted")
if supernova_path not in sys.path:
    sys.path.insert(0, supernova_path)
# Garantir que a pasta é reconhecida como pacote
init_file = os.path.join(supernova_path, "__init__.py")
if not os.path.exists(init_file):
    open(init_file, "a").close()

try:
    import db_models
    print("✅ db_models importado com sucesso")
except ImportError as e:
    print(f"⚠️ Erro ao importar db_models: {e}")

import logging
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.db_utils import get_db

try:
    from db_models import ProposalVote
except ImportError:
    ProposalVote = None

from pydantic import BaseModel

router = APIRouter()

class VoteIn(BaseModel):
    proposal_id: int
    username: str  # username of the voter
    choice: str
    voter_type: str

@router.post("/votes")
def add_vote(v: VoteIn, db: Session = Depends(get_db)):
    """
    Regista ou atualiza um voto para uma proposal. Cria o Harmonizer se não existir.
    """
    logger = logging.getLogger("votes_router")
    logger.info(f"Payload received: {v.dict()}")
    try:
        from db_models import Harmonizer

        # Buscar o Harmonizer pelo username
        harmonizer = db.query(Harmonizer).filter_by(username=v.username).first()
        if harmonizer is None:
            # Criar harmonizer automaticamente se não existir
            harmonizer = Harmonizer(username=v.username, email=f"{v.username}@example.com", hashed_password="dummy")
            db.add(harmonizer)
            db.commit()
            db.refresh(harmonizer)
            logger.info(f"Harmonizer '{v.username}' criado automaticamente.")

        harmonizer_id = harmonizer.id

        # Verifica se já existe voto para esta proposal e harmonizer
        existing_vote = db.query(ProposalVote).filter(
            ProposalVote.proposal_id == v.proposal_id,
            ProposalVote.harmonizer_id == harmonizer_id
        ).first()

        if existing_vote:
            # Atualiza voto existente
            if hasattr(existing_vote, "vote"):
                existing_vote.vote = v.choice
            if hasattr(existing_vote, "choice"):
                existing_vote.choice = v.choice
            existing_vote.voter_type = v.voter_type
        else:
            # Cria novo voto
            vote_kwargs = {
                "proposal_id": v.proposal_id,
                "harmonizer_id": harmonizer_id,
                "voter_type": v.voter_type,
            }
            if hasattr(ProposalVote, "vote"):
                vote_kwargs["vote"] = v.choice
            if hasattr(ProposalVote, "choice"):
                vote_kwargs["choice"] = v.choice
            vote = ProposalVote(**vote_kwargs)
            db.add(vote)

        db.commit()
        logger.info(f"Voto registado: Proposal {v.proposal_id}, Harmonizer {harmonizer.username}, Choice {v.choice}")
        return {"ok": True}
    except Exception as e:
        db.rollback()
        logger.exception(f"Failed to register vote: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to register vote: {str(e)}")

@router.delete("/votes")
def remove_vote(proposal_id: int, username: str, db: Session = Depends(get_db)):
    """
    Remove um voto de um usuário (harmonizer) para uma proposal. Corrige relacionamento SQLAlchemy.
    """
    logger = logging.getLogger("votes_router")
    try:
        # Buscar o Harmonizer pelo username
        try:
            from db_models import Harmonizer
        except ImportError:
            Harmonizer = None
        harmonizer = None
        if Harmonizer:
            harmonizer = db.query(Harmonizer).filter_by(username=username).first()
        if harmonizer is None:
            logger.warning(f"No harmonizer found for username '{username}'")
            raise HTTPException(status_code=404, detail=f"User '{username}' not found")
        harmonizer_id = harmonizer.id
        logger.info(f"Removing vote for proposal {proposal_id} and harmonizer_id {harmonizer_id}")
        deleted_count = db.query(ProposalVote).filter(
            ProposalVote.proposal_id == proposal_id,
            ProposalVote.harmonizer_id == harmonizer_id
        ).delete()
        db.commit()
        if deleted_count == 0:
            logger.warning(f"No vote found to remove for proposal {proposal_id} and harmonizer_id {harmonizer_id}")
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


# Debug route: GET /votes
@router.get("/votes")
def list_votes(db: Session = Depends(get_db)):
    """
    Lista todos os votos. Apenas para debug.
    """
    votes = db.query(ProposalVote).all()
    return [
        {
            "proposal_id": v.proposal_id,
            "harmonizer_id": v.harmonizer_id,
            "vote": v.vote,
            "voter_type": v.voter_type
        } for v in votes
    ]