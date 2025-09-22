from fastapi import FastAPI, HTTPException, Query, Body, Form, UploadFile, File
from pydantic import BaseModel
from typing import Optional, List, Dict
from sqlalchemy import (
    create_engine, Table, Column, Integer, String, MetaData,
    insert, select, ForeignKey, text, desc, asc, func, cast, DateTime
)
from sqlalchemy.engine import Result
from sqlalchemy.exc import OperationalError
import os
import time
import shutil
import uuid
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI, HTTPException, Query, Body, Form, UploadFile, File
from pydantic import BaseModel
from typing import Optional, List, Dict
from sqlalchemy import (
    create_engine, Table, Column, Integer, String, MetaData,
    insert, select, ForeignKey, text, desc, asc, func, cast, DateTime
)
from sqlalchemy.engine import Result
from sqlalchemy.exc import OperationalError
import os
import time
import shutil
import uuid
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Create FastAPI instance FIRST
app = FastAPI(
    title="SuperNova 2177 API",
    description="Backend API for SuperNova 2177",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure uploads directory exists and mount as static
uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")



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
    Column("author_type", String, nullable=False, server_default="human"),  # ensure column exists and not nullable
    Column("author_img", String),
    Column("date", String),
    Column("image", String, nullable=True),
    Column("video", String, nullable=True),
    Column("link", String, nullable=True),
    Column("file", String, nullable=True),
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

metadata.create_all(engine)  # create tables and columns if missing

# --- Ensure proposals.author_type column exists and fill empty values ---
with engine.connect() as conn:
    # Check if author_type column exists
    result = conn.execute(
        text(
            "SELECT column_name FROM information_schema.columns WHERE table_name='proposals' and column_name='author_type'"
        )
    )
    if not result.fetchone():
        # Add the column if it doesn't exist
        conn.execute(text("ALTER TABLE proposals ADD COLUMN author_type VARCHAR DEFAULT 'human' NOT NULL"))
        conn.commit()
    # Fill empty/null author_type with 'human'
    conn.execute(text("UPDATE proposals SET author_type='human' WHERE author_type IS NULL OR author_type=''"))
    conn.commit()


# Schemas
class ProposalIn(BaseModel):
    title: str
    body: str
    author: str
    author_type: str
    author_img: Optional[str] = ""
    date: Optional[str] = ""
    image: Optional[str] = ""
    video: Optional[str] = ""
    link: Optional[str] = ""
    file: Optional[str] = ""

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
    media: Dict = {}


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


from sqlalchemy import desc, asc, func, cast, DateTime, or_

@app.get("/health", summary="Check API health")
def health():
    return {"ok": True}


@app.get("/profile/{username}", summary="Get user profile")
def profile(username: str):
    return {"username": username, "avatar_url": "", "bio": "Explorer of superNova_2177.", "followers": 2315, "following": 1523, "status": "online"}


@app.post(
    "/proposals",
    response_model=Proposal,
    summary="Create a new proposal",
    description="Create a new proposal. All parameters except files are sent as form-data fields. Upload image and/or file optionally."
)
async def create_proposal(
    title: str = Form(..., description="Title of the proposal"),
    body: str = Form(..., description="Detailed description of the proposal"),
    author: str = Form(..., description="Name of the author"),
    author_type: str = Form(..., description="Type of the author ('human', 'company', or 'ai')"),
    author_img: str = Form("", description="URL or filename for author's avatar image"),
    date: str = Form("", description="Date string (ISO format preferred)"),
    video: str = Form("", description="URL to a video associated with the proposal"),
    link: str = Form("", description="External link related to the proposal"),
    image: Optional[UploadFile] = File(
        None,
        description="Image file to upload, optional"
    ),
    file: Optional[UploadFile] = File(
        None,
        description="Additional file to upload, optional"
    )
):
    # Validate author_type
    if author_type not in ("human", "company", "ai"):
        raise HTTPException(status_code=400, detail="Invalid author_type. Must be 'human', 'company', or 'ai'.")
    os.makedirs(uploads_dir, exist_ok=True)
    image_filename = ""
    file_filename = ""
    # Guarantee unique filenames for image and file uploads
    if image:
        ext = os.path.splitext(image.filename)[1]
        unique_img_name = f"{uuid.uuid4().hex}{ext}"
        image_path = os.path.join(uploads_dir, unique_img_name)
        with open(image_path, "wb") as f:
            content = await image.read()
            f.write(content)
        image_filename = unique_img_name
    if file:
        ext = os.path.splitext(file.filename)[1]
        unique_file_name = f"{uuid.uuid4().hex}{ext}"
        file_path = os.path.join(uploads_dir, unique_file_name)
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        file_filename = unique_file_name
    stmt = insert(proposals).values(
        title=title,
        body=body,
        author=author,
        author_type=author_type,
        author_img=author_img or "",
        date=date or "",
        image=image_filename,
        video=video or "",
        link=link or "",
        file=file_filename
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
            comments=[],
            media={
                "image": f"/uploads/{row.image}" if row.image else "",
                "video": row.video,
                "link": row.link,
                "file": f"/uploads/{row.file}" if row.file else ""
            }
        )


@app.get(
    "/proposals",
    response_model=List[Proposal],
    summary="List proposals with optional filters",
    description="List proposals with optional filtering and sorting. Use the 'filter' query parameter to control the results."
)
def list_proposals(
    filter: str = Query(
        "all",
        description="Filter proposals by type or sorting. Supported values: 'all', 'latest', 'oldest', 'topLikes', 'fewestLikes', 'ai', 'company', 'human', 'popular'.",
        enum=["all", "latest", "oldest", "topLikes", "fewestLikes", "ai", "company", "human", "popular"]
    )
):
    from datetime import datetime, timedelta
    with engine.connect() as conn:
        stmt = select(proposals)

        # FILTERS
        if filter == "latest":
            stmt = stmt.order_by(desc(proposals.c.date))
        elif filter == "oldest":
            stmt = stmt.order_by(asc(proposals.c.date))
        elif filter == "topLikes":
            vote_count = select(
                votes.c.proposal_id,
                func.count().label("likes")
            ).where(votes.c.choice == "up").group_by(votes.c.proposal_id).subquery()
            stmt = stmt.join(vote_count, proposals.c.id == vote_count.c.proposal_id).order_by(desc(vote_count.c.likes))
        elif filter == "fewestLikes":
            vote_count = select(
                votes.c.proposal_id,
                func.count().label("likes")
            ).where(votes.c.choice == "up").group_by(votes.c.proposal_id).subquery()
            stmt = stmt.join(vote_count, proposals.c.id == vote_count.c.proposal_id).order_by(asc(vote_count.c.likes))
        elif filter == "popular":
            # Proposals from the last 24h ordered by number of likes descending
            now = datetime.utcnow()
            since = now - timedelta(hours=24)
            stmt = stmt.where(cast(proposals.c.date, DateTime) >= since)
            vote_count = select(
                votes.c.proposal_id,
                func.count().label("likes")
            ).where(votes.c.choice == "up").group_by(votes.c.proposal_id).subquery()
            # Use func.coalesce to avoid null in ordering (Postgres error)
            stmt = stmt.outerjoin(vote_count, proposals.c.id == vote_count.c.proposal_id).order_by(desc(func.coalesce(vote_count.c.likes, 0)))
        elif filter in ["ai", "company", "human"]:
            # Filter strictly by proposals.author_type
            stmt = stmt.where(proposals.c.author_type == filter).order_by(desc(proposals.c.id))
        else:  # "all" or invalid
            stmt = stmt.order_by(desc(proposals.c.id))

        try:
            result = conn.execute(stmt)
        except Exception as e:
            # Return a generic error message in English
            raise HTTPException(status_code=500, detail=f"Failed to fetch proposals: {str(e)}")
        proposals_list = []
        for row in result.fetchall():
            vote_stmt = select(votes).where(votes.c.proposal_id == row.id)
            vote_res = conn.execute(vote_stmt).fetchall()
            likes = [{"voter": v.voter, "type": v.voter_type} for v in vote_res if v.choice == "up"]
            dislikes = [{"voter": v.voter, "type": v.voter_type} for v in vote_res if v.choice == "down"]

            comment_stmt = select(comments).where(comments.c.proposal_id == row.id)
            comment_res = conn.execute(comment_stmt).fetchall()
            comments_list = [{"proposal_id": c.proposal_id, "user": c.user, "user_img": c.user_img, "comment": c.comment} for c in comment_res]

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
                "comments": comments_list,
                "media": {
                    "image": f"/uploads/{row.image}" if row.image else "",
                    "video": row.video,
                    "link": row.link,
                    "file": f"/uploads/{row.file}" if row.file else ""
                }
            })
        return proposals_list

@app.get("/proposals/{pid}/tally", summary="Get vote tally for a proposal")
def tally(pid: int):
    with engine.connect() as conn:
        up_stmt = select(votes).where(votes.c.proposal_id == pid).where(votes.c.choice == "up")
        down_stmt = select(votes).where(votes.c.proposal_id == pid).where(votes.c.choice == "down")
        up_count = len(conn.execute(up_stmt).fetchall())
        down_count = len(conn.execute(down_stmt).fetchall())
        return {"up": up_count, "down": down_count}


@app.post(
    "/votes",
    summary="Add a vote to a proposal",
    description="Add a vote (up or down) to a proposal. The body must include proposal_id, voter, choice, and voter_type."
)
def add_vote(
    v: VoteIn = Body(
        ...,
        description="Vote object. 'choice' must be 'up' or 'down'. 'voter_type' must be 'human', 'company', or 'ai'."
    )
):
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


@app.post(
    "/comments",
    summary="Add a comment to a proposal",
    description="Add a comment to a proposal. The body must include proposal_id, user, user_img, and comment."
)
def add_comment(
    c: CommentIn = Body(
        ...,
        description="Comment object. 'user_img' is optional."
    )
):
    with engine.connect() as conn:
        proposal_stmt = select(proposals).where(proposals.c.id == c.proposal_id)
        proposal = conn.execute(proposal_stmt).fetchone()
        if not proposal:
            raise HTTPException(status_code=404, detail="Proposal not found")
        # Ensure user and user_img are not empty; if empty, assign defaults
        user = c.user or "Anonymous"
        user_img = c.user_img or "/uploads/default_avatar.png"
        stmt = insert(comments).values(
            proposal_id=c.proposal_id,
            user=user,
            user_img=user_img,
            comment=c.comment
        )
        conn.execute(stmt)
        conn.commit()
        return {"ok": True}


@app.post("/decide/{pid}", response_model=Decision, summary="Make a decision for a proposal based on votes")
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


@app.get("/decisions", response_model=List[Decision], summary="List all decisions")
def list_decisions():
    with engine.connect() as conn:
        stmt = select(decisions).order_by(decisions.c.id.desc())
        result = conn.execute(stmt)
        return [Decision(id=row.id, proposal_id=row.proposal_id, status=row.status) for row in result.fetchall()]


@app.post("/runs", response_model=Run, summary="Create a run for a decision")
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


# Upload image ensuring unique filename
@app.post("/upload-image", summary="Upload an image file")
async def upload_image(file: UploadFile = File(...)):
    os.makedirs(uploads_dir, exist_ok=True)
    ext = os.path.splitext(file.filename)[1]
    unique_name = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(uploads_dir, unique_name)
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    return {"filename": unique_name, "url": f"/uploads/{unique_name}"}

# Upload any file ensuring unique filename
@app.post("/upload-file", summary="Upload a generic file")
async def upload_file(file: UploadFile = File(...)):
    os.makedirs(uploads_dir, exist_ok=True)
    ext = os.path.splitext(file.filename)[1]
    unique_name = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(uploads_dir, unique_name)
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    return {"filename": unique_name, "url": f"/uploads/{unique_name}"}

@app.get("/runs", response_model=List[Run], summary="List all runs")
def list_runs():
    with engine.connect() as conn:
        stmt = select(runs).order_by(runs.c.id.desc())
        result = conn.execute(stmt)
        return [Run(id=row.id, decision_id=row.decision_id, status=row.status) for row in result.fetchall()]

@app.get("/proposals/{pid}", summary="Get a proposal by ID", response_model=Proposal)
def get_proposal(pid: int):
    with engine.connect() as conn:
        # Busca a proposta pelo id
        stmt = select(proposals).where(proposals.c.id == pid)
        row = conn.execute(stmt).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Proposal not found")

        # Busca likes e dislikes
        vote_stmt = select(votes).where(votes.c.proposal_id == row.id)
        vote_res = conn.execute(vote_stmt).fetchall()
        likes = [{"voter": v.voter, "type": v.voter_type} for v in vote_res if v.choice == "up"]
        dislikes = [{"voter": v.voter, "type": v.voter_type} for v in vote_res if v.choice == "down"]

        # Busca comentários
        comment_stmt = select(comments).where(comments.c.proposal_id == row.id)
        comment_res = conn.execute(comment_stmt).fetchall()
        comments_list = [
            {"proposal_id": c.proposal_id, "user": c.user, "user_img": c.user_img, "comment": c.comment}
            for c in comment_res
        ]

        # Inicials do user
        user_initials = (row.author[:2]).upper() if row.author else ""

        return Proposal(
            id=row.id,
            title=row.title,
            text=row.body,
            userName=row.author,
            userInitials=user_initials,
            author_img=row.author_img,
            time=row.date,
            likes=likes,
            dislikes=dislikes,
            comments=comments_list,
            media={
                "image": f"/uploads/{row.image}" if row.image else "",
                "video": row.video,
                "link": row.link,
                "file": f"/uploads/{row.file}" if row.file else ""
            }
        )
        
@app.delete("/proposals/{pid}", summary="Delete a proposal by ID")
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

@app.delete("/proposals", summary="Delete all proposals")
def delete_all_proposals():
    with engine.connect() as conn:
        # Apaga comentários e votos primeiro
        conn.execute(comments.delete())
        conn.execute(votes.delete())
        # Apaga todas as proposals
        deleted = conn.execute(proposals.delete())
        conn.commit()
        return {"ok": True, "deleted_count": deleted.rowcount}

@app.delete("/votes", summary="Remove a vote from a proposal")
def remove_vote(proposal_id: int, voter: str):
    with engine.connect() as conn:
        stmt = votes.delete().where(
            votes.c.proposal_id == proposal_id,
            votes.c.voter == voter
        )
        result = conn.execute(stmt)
        conn.commit()
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Vote not found")
        return {"ok": True, "removed": result.rowcount}