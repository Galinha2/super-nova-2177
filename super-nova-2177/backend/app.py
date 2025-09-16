from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict
from sqlalchemy import (
    create_engine, Table, Column, Integer, String, MetaData,
    insert, select, ForeignKey, text
)
from sqlalchemy.engine import Result
import os
import time
from sqlalchemy.exc import OperationalError

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="superNova_2177 backend", version="0.2")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # permite qualquer origem
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_URL = os.environ.get(
    "DATABASE_URL", 
    "postgresql://postgres:example@db:5432/postgres"
)

engine = None
for i in range(10):  # tenta 10 vezes
    try:
        engine = create_engine(DATABASE_URL, future=True)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("Connected to DB")
        break
    except OperationalError:
        print("Postgres not ready, retrying...")
        time.sleep(3)
else:
    raise Exception("Cannot connect to Postgres")

metadata = MetaData()

proposals = Table(
    "proposals",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("title", String),
    Column("body", String),
    Column("author", String),
    Column("author_img", String),
    Column("date", String),
)

votes = Table(
    "votes",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("proposal_id", Integer, ForeignKey("proposals.id")),
    Column("voter", String),
    Column("choice", String),  # 'up' or 'down'
    Column("voter_type", String),  # 'human' | 'company' | 'ai'
)

comments = Table(
    "comments",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("proposal_id", Integer, ForeignKey("proposals.id")),
    Column("user", String),
    Column("user_img", String),
    Column("comment", String),
)

decisions = Table(
    "decisions",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("proposal_id", Integer, ForeignKey("proposals.id")),
    Column("status", String),
)

runs = Table(
    "runs",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("decision_id", Integer, ForeignKey("decisions.id")),
    Column("status", String),
)

metadata.create_all(engine)  # cria tabelas


# Schemas
class ProposalIn(BaseModel):
    title: str
    body: str
    author: str
    author_img: Optional[str] = ""
    date: Optional[str] = ""


class Proposal(BaseModel):
    id: int
    title: str
    text: str
    userName: str
    userInitials: str
    author_img: str
    time: str
    likes: List[Dict] = []
    dislikes: List[Dict] = []
    comments: List[Dict] = []


class VoteIn(BaseModel):
    proposal_id: int
    voter: str
    choice: str  # 'up' | 'down'
    voter_type: str  # 'human' | 'company' | 'ai'


class Decision(BaseModel):
    id: int
    proposal_id: int
    status: str


class Run(BaseModel):
    id: int
    decision_id: int
    status: str


class CommentIn(BaseModel):
    proposal_id: int
    user: str
    user_img: str
    comment: str


# Endpoints
@app.get("/health")
def health():
    return {"ok": True}


@app.get("/profile/{username}")
def profile(username: str):
    return {"username": username, "avatar_url": "", "bio": "Explorer of superNova_2177.", "followers": 2315, "following": 1523, "status": "online"}


@app.post("/proposals", response_model=Proposal)
def create_proposal(p: ProposalIn):
    stmt = insert(proposals).values(
        title=p.title,
        body=p.body,
        author=p.author,
        author_img=p.author_img or "",
        date=p.date or ""
    ).returning(proposals)
    with engine.connect() as conn:
        result: Result = conn.execute(stmt)
        conn.commit()
        row = result.fetchone()
        if not row:
            raise HTTPException(status_code=500, detail="Failed to create proposal")
        return Proposal(
            id=row.id,
            title=row.title,
            text=row.body,
            userName=row.author,
            userInitials=(row.author[:2]).upper() if row.author else "",
            author_img=row.author_img,
            time=row.date,
            likes=[],
            dislikes=[],
            comments=[]
        )


@app.get("/proposals", response_model=List[Proposal])
def list_proposals():
    with engine.connect() as conn:
        stmt = select(proposals).order_by(proposals.c.id.desc())
        result = conn.execute(stmt)
        proposals_list = []
        for row in result.fetchall():
            # Fetch votes
            vote_stmt = select(votes).where(votes.c.proposal_id == row.id)
            vote_res = conn.execute(vote_stmt).fetchall()
            likes = [{"voter": v.voter, "type": v.voter_type} for v in vote_res if v.choice == "up"]
            dislikes = [{"voter": v.voter, "type": v.voter_type} for v in vote_res if v.choice == "down"]
            # Fetch comments
            comment_stmt = select(comments).where(comments.c.proposal_id == row.id)
            comment_res = conn.execute(comment_stmt).fetchall()
            comments_list = [{"proposal_id": c.proposal_id, "user": c.user, "user_img": c.user_img, "comment": c.comment} for c in comment_res]
            # Prepare userInitials
            user_initials = (row.author[:2]).upper() if row.author else ""
            proposals_list.append({
                "id": row.id,
                "title": row.title,
                "userName": row.author,
                "userInitials": user_initials,
                "text": row.body,
                "author_img": row.author_img,
                "time": row.date,
                "likes": likes,
                "dislikes": dislikes,
                "comments": comments_list
            })
        return proposals_list


@app.get("/proposals/{pid}/tally")
def tally(pid: int):
    with engine.connect() as conn:
        up_stmt = select(votes).where(votes.c.proposal_id == pid).where(votes.c.choice == "up")
        down_stmt = select(votes).where(votes.c.proposal_id == pid).where(votes.c.choice == "down")
        up_count = len(conn.execute(up_stmt).fetchall())
        down_count = len(conn.execute(down_stmt).fetchall())
        return {"up": up_count, "down": down_count}


@app.post("/votes")
def add_vote(v: VoteIn):
    with engine.connect() as conn:
        proposal_stmt = select(proposals).where(proposals.c.id == v.proposal_id)
        proposal = conn.execute(proposal_stmt).fetchone()
        if not proposal:
            raise HTTPException(status_code=404, detail="Proposal not found")
        stmt = insert(votes).values(
            proposal_id=v.proposal_id,
            voter=v.voter,
            choice=v.choice,
            voter_type=v.voter_type
        )
        conn.execute(stmt)
        conn.commit()
        return {"ok": True}


@app.post("/comments")
def add_comment(c: CommentIn):
    with engine.connect() as conn:
        proposal_stmt = select(proposals).where(proposals.c.id == c.proposal_id)
        proposal = conn.execute(proposal_stmt).fetchone()
        if not proposal:
            raise HTTPException(status_code=404, detail="Proposal not found")
        stmt = insert(comments).values(
            proposal_id=c.proposal_id,
            user=c.user,
            user_img=c.user_img,
            comment=c.comment
        )
        conn.execute(stmt)
        conn.commit()
        return {"ok": True}


@app.post("/decide/{pid}", response_model=Decision)
def decide(pid: int, threshold: float = 0.6):
    tally_result = tally(pid)
    total = tally_result["up"] + tally_result["down"]
    status = "rejected"
    if total > 0 and (tally_result["up"] / total) >= threshold:
        status = "accepted"
    with engine.connect() as conn:
        existing_decision_stmt = select(decisions).where(decisions.c.proposal_id == pid)
        existing_decision = conn.execute(existing_decision_stmt).fetchone()
        if existing_decision:
            update_stmt = decisions.update().where(decisions.c.id == existing_decision.id).values(status=status).returning(decisions)
            result = conn.execute(update_stmt)
            conn.commit()
            row = result.fetchone()
            return Decision(id=row.id, proposal_id=row.proposal_id, status=row.status)
        else:
            insert_stmt = insert(decisions).values(proposal_id=pid, status=status).returning(decisions)
            result = conn.execute(insert_stmt)
            conn.commit()
            row = result.fetchone()
            return Decision(id=row.id, proposal_id=row.proposal_id, status=row.status)


@app.get("/decisions", response_model=List[Decision])
def list_decisions():
    with engine.connect() as conn:
        stmt = select(decisions).order_by(decisions.c.id.desc())
        result = conn.execute(stmt)
        return [Decision(id=row.id, proposal_id=row.proposal_id, status=row.status) for row in result.fetchall()]


@app.post("/runs", response_model=Run)
def create_run(decision_id: int):
    with engine.connect() as conn:
        decision_stmt = select(decisions).where(decisions.c.id == decision_id)
        decision = conn.execute(decision_stmt).fetchone()
        if not decision:
            raise HTTPException(status_code=404, detail="Decision not found")
        insert_stmt = insert(runs).values(decision_id=decision_id, status="done").returning(runs)
        result = conn.execute(insert_stmt)
        conn.commit()
        row = result.fetchone()
        return Run(id=row.id, decision_id=row.decision_id, status=row.status)


@app.get("/runs", response_model=List[Run])
def list_runs():
    with engine.connect() as conn:
        stmt = select(runs).order_by(runs.c.id.desc())
        result = conn.execute(stmt)
        return [Run(id=row.id, decision_id=row.decision_id, status=row.status) for row in result.fetchall()]
    
@app.delete("/proposals/{pid}")
def delete_proposal(pid: int):
    with engine.connect() as conn:
        # Verifica se existe a proposal
        proposal_stmt = select(proposals).where(proposals.c.id == pid)
        proposal = conn.execute(proposal_stmt).fetchone()
        if not proposal:
            raise HTTPException(status_code=404, detail="Proposal not found")
        
        # Apaga comentários associados
        conn.execute(comments.delete().where(comments.c.proposal_id == pid))
        # Apaga votos associados
        conn.execute(votes.delete().where(votes.c.proposal_id == pid))
        # Apaga a proposal
        conn.execute(proposals.delete().where(proposals.c.id == pid))
        conn.commit()
        return {"ok": True, "deleted_id": pid}

@app.delete("/proposals")
def delete_all_proposals():
    with engine.connect() as conn:
        # Apaga comentários e votos primeiro
        conn.execute(comments.delete())
        conn.execute(votes.delete())
        # Apaga todas as proposals
        deleted = conn.execute(proposals.delete())
        conn.commit()
        return {"ok": True, "deleted_count": deleted.rowcount}