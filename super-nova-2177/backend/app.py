import sys
import os
import time
import shutil
import uuid
from datetime import datetime
from fastapi import FastAPI, HTTPException, Query, Form, UploadFile, File, Depends, APIRouter
from pydantic import BaseModel
from typing import Optional, List, Dict
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import or_, desc, asc, func, text
from sqlalchemy.orm import Session

# Debug info
print("=== DEBUG INFO ===")
print(f"Current directory: {os.getcwd()}")
print(f"Directory contents: {os.listdir('.')}")

# PRIMEIRO: Encontrar o diretório do SuperNova
possible_paths = [
    '/app/supernova_2177_ui_weighted',  # Caminho no container
    '/supernova_2177_ui_weighted',      # Caminho alternativo
    os.path.join(os.path.dirname(__file__), 'supernova_2177_ui_weighted'),
    os.path.join(os.path.dirname(__file__), '..', 'supernova_2177_ui_weighted'),
]

supernova_dir = None
for path in possible_paths:
    path = os.path.normpath(path)
    print(f"Checking path: {path}")
    if os.path.exists(path) and os.path.isdir(path):
        supernova_dir = path
        print(f"✅ Found SuperNova directory at: {path}")
        print(f"Contents: {os.listdir(path)}")
        break

# DEPOIS: Verificar o arquivo específico
if supernova_dir:
    supernova_file_path = os.path.join(supernova_dir, 'supernova_2177.py')
    print(f"=== VERIFICAÇÃO DE CAMINHO ===")
    print(f"Caminho do arquivo supernova_2177.py: {supernova_file_path}")
    print(f"O arquivo existe: {os.path.isfile(supernova_file_path)}")

    if os.path.isfile(supernova_file_path):
        try:
            with open(supernova_file_path, 'r') as f:
                first_lines = [next(f) for _ in range(10)]
            print("Primeiras linhas do arquivo:")
            for line in first_lines:
                print(">", line.rstrip())
        except Exception as e:
            print(f"Não foi possível ler o arquivo: {e}")

if not supernova_dir:
    print("❌ SuperNova directory not found in any known location")
    SUPER_NOVA_AVAILABLE = False
else:
    # Adicionar ao Python path
    if supernova_dir not in sys.path:
        sys.path.insert(0, supernova_dir)
    
    try:
        from supernova_2177_ui_weighted.superNova_2177 import (
            register_vote, tally_votes, decide as weighted_decide, 
            get_threshold as get_weighted_threshold, SessionLocal, get_db,
            get_settings, DB_ENGINE_URL
        )
        from supernova_2177_ui_weighted.db_models import (
            Proposal, ProposalVote, Comment, Decision, Run, Harmonizer, VibeNode, SystemState
        )
        SUPER_NOVA_AVAILABLE = True
        print("✅ SuperNova 2177 integration: ENABLED")
    except ImportError as e:
        print(f"❌ SuperNova import failed: {e}")
        import traceback
        traceback.print_exc()
        SUPER_NOVA_AVAILABLE = False
    except NameError as e:
        print(f"❌ NameError in SuperNova import (app not defined): {e}")
        import traceback
        traceback.print_exc()
        SUPER_NOVA_AVAILABLE = False
    except Exception as e:
        print(f"❌ Unexpected error importing SuperNova: {e}")
        import traceback
        traceback.print_exc()
        SUPER_NOVA_AVAILABLE = False

# Fallback de SessionLocal e get_db se SuperNova não estiver disponível
if not SUPER_NOVA_AVAILABLE:
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker

    DATABASE_URL = os.environ.get(
        "DATABASE_URL", 
        "postgresql://postgres:example@db:5432/postgres"
    )

    engine = create_engine(DATABASE_URL, future=True)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    def get_db():
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()

if not SUPER_NOVA_AVAILABLE:
    print("🔄 SuperNova not available, using standalone mode")
    
    # Definir funções fallback
    def register_vote(*args, **kwargs):
        return {"ok": True, "note": "standalone mode"}
    
    def tally_votes(*args, **kwargs):
        return {"up": 0, "down": 0, "total": 0}
    
    def decide(*args, **kwargs):
        return {"status": "undecided", "note": "standalone mode"}
    
    def get_threshold(*args, **kwargs):
        return 0.6
    
    def get_settings():
        class Settings:
            DB_MODE = "standalone"
            UNIVERSE_ID = "standalone"
            @property
            def engine_url(self):
                return "sqlite:///standalone.db"
        return Settings()
    
    DB_ENGINE_URL = "sqlite:///standalone.db"

# Se SuperNova não está disponível, configurar fallback
if not SUPER_NOVA_AVAILABLE:
    print("🔄 Using fallback database configuration")
    from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String, ForeignKey, Text, DateTime
    from sqlalchemy.orm import sessionmaker
    
    DATABASE_URL = os.environ.get(
        "DATABASE_URL", 
        "postgresql://postgres:example@db:5432/postgres"
    )
    
    engine = None
    for i in range(10):
        try:
            engine = create_engine(DATABASE_URL, future=True)
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            print("✅ Connected to DB")
            break
        except Exception as e:
            print(f"⏳ Postgres not ready, retrying... ({e})")
            time.sleep(3)
    else:
        raise Exception("Cannot connect to Postgres")
    
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    def get_db():
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()

def register_vote(proposal_id: int, voter: str, choice: str, species: str = "human"):
    """
    Regista um voto ponderado no sistema SuperNova.
    Aplica pesos diferentes consoante a espécie votante (humano, empresa, IA).
    """
    weights = {"human": 1.0, "company": 1.5, "ai": 1.2}
    weight = weights.get(species.lower(), 1.0)

    # Aqui podes ligar à BD se quiseres guardar o voto
    try:
        session = SessionLocal()
        vote_entry = ProposalVote(
            proposal_id=proposal_id,
            voter=voter,
            choice=choice,
            voter_type=species,
            weight=weight
        )
        session.add(vote_entry)
        session.commit()
        return {"ok": True, "proposal_id": proposal_id, "voter": voter, "choice": choice, "weight": weight}
    except Exception as e:
        print(f"⚠️ Erro ao registar voto ponderado: {e}")
        return {"ok": False, "error": str(e)}
    finally:
        if 'session' in locals():
            session.close()
            
# --- FastAPI setup ---
app = FastAPI(
    title="SuperNova 2177 API",
    description="Backend API for SuperNova 2177 - Unified Version",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# --- Schemas (compat frontend) ---
class ProposalIn(BaseModel):
    title: str
    body: str
    author: str
    author_type: Optional[str] = ""
    author_img: Optional[str] = ""
    date: Optional[str] = ""
    image: Optional[str] = ""
    video: Optional[str] = ""
    link: Optional[str] = ""
    file: Optional[str] = ""

class ProposalSchema(BaseModel):
    id: int
    title: str
    text: str
    userName: str
    userInitials: str
    author_img: str
    time: datetime
    author_type: Optional[str] = ""
    likes: List[Dict] = []
    dislikes: List[Dict] = []
    comments: List[Dict] = []
    media: Dict = {}

class VoteIn(BaseModel):
    proposal_id: int
    voter: str
    choice: str
    voter_type: str

class DecisionSchema(BaseModel):
    id: int
    proposal_id: int
    status: str

class RunSchema(BaseModel):
    id: int
    decision_id: int
    status: str

class CommentIn(BaseModel):
    proposal_id: int
    user: str
    user_img: str
    comment: str

# --- Universe Info Endpoint ---
@app.get("/universe/info", tags=["System"])
def universe_info():
    """Return details about the current database configuration."""
    if not SUPER_NOVA_AVAILABLE:
        # Fallback response when SuperNova is not available
        return {
            "mode": "standalone",
            "engine": "sqlite:///fallback.db", 
            "universe_id": "standalone_universe",
            "note": "SuperNova integration not available"
        }
    
    try:
        s = get_settings()
        return {
            "mode": s.DB_MODE,
            "engine": DB_ENGINE_URL or s.engine_url,
            "universe_id": s.UNIVERSE_ID,
        }
    except Exception as e:
        return {
            "error": f"Failed to get universe info: {str(e)}",
            "mode": "error",
            "engine": "unknown",
            "universe_id": "error"
        }

# --- Health & Status ---
@app.get("/health", summary="Check API health")
def health(db: Session = Depends(get_db)):
    supernova_status = "connected" if SUPER_NOVA_AVAILABLE else "disconnected"
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception:
        db_status = "disconnected"
    
    return {
        "ok": True,
        "database": db_status,
        "supernova_integration": supernova_status,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/universe", summary="Get simplified universe state")
def get_universe_state():
    """
    Returns a mock representation of the current universe graph,
    including proposals, decisions, and links.
    """
    return {
        "nodes": [
            {"id": "u1", "label": "Proposal A", "type": "proposal", "votes": {"human": 12, "company": 5, "ai": 2}},
            {"id": "u2", "label": "Decision B", "type": "decision", "votes": {"human": 4, "company": 10, "ai": 1}},
        ],
        "links": [
            {"source": "u1", "target": "u2"},
        ]
    }
   
@app.get("/supernova-status", summary="Check SuperNova integration status")
def supernova_status():
    return {
        "supernova_connected": SUPER_NOVA_AVAILABLE,
        "features_available": {
            "weighted_voting": SUPER_NOVA_AVAILABLE,
            "karma_system": SUPER_NOVA_AVAILABLE,
            "governance": SUPER_NOVA_AVAILABLE,
            "search_filters": True,
            "advanced_sorting": True
        }
    }

# --- Debug endpoints para testar search e filtros ---
@app.get("/debug-supernova")
def debug_supernova():
    import os
    import sys
    return {
        "supernova_available": SUPER_NOVA_AVAILABLE,  # Use your global variable
        "python_path": sys.path,
        "current_dir": os.getcwd(),
        "dir_contents": os.listdir('.'),
        "supernova_dir_exists": os.path.exists('./supernova-2177-ui-weighted')
    }

@app.get("/debug/search-test")
def debug_search(search: str = Query(...), db: Session = Depends(get_db)):
    """Teste de funcionalidade de search"""
    try:
        if SUPER_NOVA_AVAILABLE:
            # Teste com ORM
            results = db.query(Proposal).filter(
                or_(
                    Proposal.title.ilike(f"%{search}%"),
                    Proposal.description.ilike(f"%{search}%"),
                    Proposal.author_username.ilike(f"%{search}%")
                )
            ).limit(5).all()
            
            return {
                "search_term": search,
                "found_proposals": len(results),
                "results": [
                    {"id": r.id, "title": r.title, "author": r.author_username} 
                    for r in results
                ],
                "method": "orm"
            }
        else:
            # Teste com SQL direto
            result = db.execute(
                text("SELECT id, title, author FROM proposals WHERE title ILIKE :search OR body ILIKE :search OR author ILIKE :search LIMIT 5"),
                {"search": f"%{search}%"}
            )
            rows = result.fetchall()
            
            return {
                "search_term": search,
                "found_proposals": len(rows),
                "results": [dict(row) for row in rows],
                "method": "sql"
            }
    except Exception as e:
        return {"error": str(e), "query_working": False}

# --- Profile endpoint ---
@app.get("/profile/{username}", summary="Get user profile")
def profile(username: str, db: Session = Depends(get_db)):
    if SUPER_NOVA_AVAILABLE:
        try:
            user = db.query(Harmonizer).filter(Harmonizer.username == username).first()
            if user:
                return {
                    "username": user.username,
                    "avatar_url": user.avatar_url or "",
                    "bio": user.bio or "Explorer of superNova_2177.",
                    "followers": getattr(user, 'followers_count', 2315),
                    "following": getattr(user, 'following_count', 1523),
                    "status": "online",
                    "karma": float(getattr(user, 'karma_score', 0)),
                    "harmony_score": float(getattr(user, 'harmony_score', 0)),
                    "creative_spark": float(getattr(user, 'creative_spark', 0)),
                    "species": getattr(user, 'species', 'human')
                }
        except Exception as e:
            print(f"Error fetching SuperNova profile: {e}")
    
    # Fallback
    return {
        "username": username,
        "avatar_url": "",
        "bio": "Explorer of superNova_2177.",
        "followers": 2315,
        "following": 1523,
        "status": "online"
    }

# --- Create proposal ---
@app.post("/proposals", response_model=ProposalSchema, summary="Create a new proposal")
async def create_proposal(
    title: str = Form(...),
    body: str = Form(...),
    author: str = Form(...),
    author_type: str = Form("human"),
    author_img: str = Form(""),
    date: str = Form(""),
    video: str = Form(""),
    link: str = Form(""),
    image: Optional[UploadFile] = File(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    if author_type not in ("human", "company", "ai"):
        raise HTTPException(status_code=400, detail="Invalid author_type")
    
    os.makedirs(uploads_dir, exist_ok=True)
    image_filename = ""
    file_filename = ""
    
    # Process uploads
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

    # Use SuperNova ORM if available
    if SUPER_NOVA_AVAILABLE:
        try:
            db_proposal = Proposal(
                title=title,
                description=body,
                author_username=author,
                author_type=author_type,
                author_img=author_img,
                image=image_filename,
                video=video,
                link=link,
                file=file_filename,
                created_at=datetime.now()
            )
            db.add(db_proposal)
            db.commit()
            db.refresh(db_proposal)
            
            return ProposalSchema(
                id=db_proposal.id,
                title=db_proposal.title,
                text=db_proposal.description,
                userName=db_proposal.author_username,
                userInitials=(db_proposal.author_username[:2]).upper() if db_proposal.author_username else "",
                author_img=db_proposal.author_img,
                time=db_proposal.created_at.isoformat(),
                author_type=db_proposal.author_type,
                likes=[],
                dislikes=[],
                comments=[],
                media={
                    "image": f"/uploads/{db_proposal.image}" if db_proposal.image else "",
                    "video": db_proposal.video,
                    "link": db_proposal.link,
                    "file": f"/uploads/{db_proposal.file}" if db_proposal.file else ""
                }
            )
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Failed to create proposal: {str(e)}")
    else:
        # Fallback para SQL direto
        try:
            result = db.execute(
                text("""
                    INSERT INTO proposals (title, body, author, author_type, author_img, date, image, video, link, file) 
                    VALUES (:title, :body, :author, :author_type, :author_img, :date, :image, :video, :link, :file)
                    RETURNING id
                """),
                {
                    "title": title, "body": body, "author": author, "author_type": author_type,
                    "author_img": author_img, "date": date or datetime.now().isoformat(),
                    "image": image_filename, "video": video, "link": link, "file": file_filename
                }
            )
            db.commit()
            row = result.fetchone()
            proposal_id = row[0] if row else None
            
            if not proposal_id:
                raise HTTPException(status_code=500, detail="Failed to create proposal")
            
            return ProposalSchema(
                id=proposal_id,
                title=title,
                text=body,
                userName=author,
                userInitials=(author[:2]).upper() if author else "",
                author_img=author_img,
                time=date or datetime.now().isoformat(),
                author_type=author_type,
                likes=[],
                dislikes=[],
                comments=[],
                media={
                    "image": f"/uploads/{image_filename}" if image_filename else "",
                    "video": video,
                    "link": link,
                    "file": f"/uploads/{file_filename}" if file_filename else ""
                }
            )
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Failed to create proposal: {str(e)}")

# --- LIST PROPOSALS - CORRIGIDO com search e filtros funcionando ---
@app.get("/proposals", response_model=List[ProposalSchema])
def list_proposals(
    filter: str = Query("all"),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    try:
        if SUPER_NOVA_AVAILABLE:
            # Query base com ORM
            query = db.query(Proposal)
            
            # 🔍 SEARCH FUNCTIONALITY - CORRIGIDO
            if search and search.strip():
                search_filter = f"%{search}%"
                query = query.filter(
                    or_(
                        Proposal.title.ilike(search_filter),
                        Proposal.description.ilike(search_filter),
                        Proposal.author_username.ilike(search_filter)
                    )
                )
            
            # 🎯 FILTERS - CORRIGIDOS
            if filter == "latest":
                query = query.order_by(desc(Proposal.created_at))
            elif filter == "oldest":
                query = query.order_by(asc(Proposal.created_at))
            elif filter == "topLikes":
                # ✅ TOP LIKED - Agora funciona
                from sqlalchemy import case
                likes_count = func.sum(
                    case((ProposalVote.choice == "up", 1), else_=0)
                ).label("likes_count")
                
                query = query.outerjoin(ProposalVote, Proposal.id == ProposalVote.proposal_id)
                query = query.group_by(Proposal.id)
                query = query.order_by(desc(likes_count))
                
            elif filter == "fewestLikes":
                # ✅ FEWEST LIKES - Agora funciona
                from sqlalchemy import case
                likes_count = func.sum(
                    case((ProposalVote.choice == "up", 1), else_=0)
                ).label("likes_count")
                
                query = query.outerjoin(ProposalVote, Proposal.id == ProposalVote.proposal_id)
                query = query.group_by(Proposal.id)
                query = query.order_by(asc(likes_count))
                
            elif filter == "popular":
                # ✅ POPULAR (mais votos totais)
                from sqlalchemy import case
                total_votes = func.count(ProposalVote.id).label("total_votes")
                
                query = query.outerjoin(ProposalVote, Proposal.id == ProposalVote.proposal_id)
                query = query.group_by(Proposal.id)
                query = query.order_by(desc(total_votes))
                
            elif filter in ["ai", "company", "human"]:
                query = query.filter(Proposal.author_type == filter)
            else:  # "all"
                query = query.order_by(desc(Proposal.id))
            
            proposals = query.all()
            
        else:
            # 🔍 FALLBACK: SQL direto com search
            base_query = "SELECT * FROM proposals WHERE 1=1"
            params = {}
            
            if search and search.strip():
                base_query += " AND (title ILIKE :search OR body ILIKE :search OR author ILIKE :search)"
                params["search"] = f"%{search}%"
            
            # 🎯 FALLBACK: Filtros com SQL
            if filter == "latest":
                base_query += " ORDER BY date DESC"
            elif filter == "oldest":
                base_query += " ORDER BY date ASC"
            elif filter == "topLikes":
                base_query = """
                    SELECT p.*, COUNT(v.id) as like_count 
                    FROM proposals p 
                    LEFT JOIN votes v ON p.id = v.proposal_id AND v.choice = 'up' 
                    GROUP BY p.id 
                    ORDER BY like_count DESC
                """
            elif filter == "fewestLikes":
                base_query = """
                    SELECT p.*, COUNT(v.id) as like_count 
                    FROM proposals p 
                    LEFT JOIN votes v ON p.id = v.proposal_id AND v.choice = 'up' 
                    GROUP BY p.id 
                    ORDER BY like_count ASC
                """
            elif filter in ["ai", "company", "human"]:
                base_query += " AND author_type = :filter ORDER BY id DESC"
                params["filter"] = filter
            else:
                base_query += " ORDER BY id DESC"
            
            result = db.execute(text(base_query), params)
            proposals_data = result.fetchall()
            
            # Converter para objetos Proposal se necessário
            if SUPER_NOVA_AVAILABLE:
                proposals = [Proposal(**dict(row)) for row in proposals_data]
            else:
                proposals = proposals_data
        
        # 🏗️ CONSTRUIR RESPOSTA
        proposals_list = []
        for prop in proposals:
            if SUPER_NOVA_AVAILABLE:
                # Buscar votos e comentários com ORM
                votes = db.query(ProposalVote).filter(ProposalVote.proposal_id == prop.id).all()
                comments = db.query(Comment).filter(Comment.proposal_id == prop.id).all()
                
                proposal_data = {
                    "id": prop.id,
                    "title": prop.title,
                    "userName": prop.author_username,
                    "userInitials": (prop.author_username[:2]).upper() if prop.author_username else "",
                    "text": prop.description,
                    "author_img": prop.author_img,
                    "time": prop.created_at.isoformat() if hasattr(prop, 'created_at') and prop.created_at else "",
                    "author_type": prop.author_type,
                    "likes": [{"voter": v.voter, "type": v.voter_type} for v in votes if v.choice == "up"],
                    "dislikes": [{"voter": v.voter, "type": v.voter_type} for v in votes if v.choice == "down"],
                    "comments": [{"proposal_id": c.proposal_id, "user": c.user, "user_img": c.user_img, "comment": c.comment} for c in comments],
                    "media": {
                        "image": f"/uploads/{prop.image}" if prop.image else "",
                        "video": prop.video,
                        "link": prop.link,
                        "file": f"/uploads/{prop.file}" if prop.file else ""
                    }
                }
            else:
                # Buscar votos e comentários com SQL direto
                votes_result = db.execute(
                    text("SELECT * FROM votes WHERE proposal_id = :pid"),
                    {"pid": prop.id}
                )
                votes = votes_result.fetchall()
                
                comments_result = db.execute(
                    text("SELECT * FROM comments WHERE proposal_id = :pid"),
                    {"pid": prop.id}
                )
                comments = comments_result.fetchall()
                
                proposal_data = {
                    "id": prop.id,
                    "title": prop.title,
                    "userName": prop.author,
                    "userInitials": (prop.author[:2]).upper() if prop.author else "",
                    "text": prop.body,
                    "author_img": prop.author_img,
                    "time": prop.date,
                    "author_type": prop.author_type,
                    "likes": [{"voter": v.voter, "type": v.voter_type} for v in votes if v.choice == "up"],
                    "dislikes": [{"voter": v.voter, "type": v.voter_type} for v in votes if v.choice == "down"],
                    "comments": [{"proposal_id": c.proposal_id, "user": c.user, "user_img": c.user_img, "comment": c.comment} for c in comments],
                    "media": {
                        "image": f"/uploads/{prop.image}" if prop.image else "",
                        "video": prop.video,
                        "link": prop.link,
                        "file": f"/uploads/{prop.file}" if prop.file else ""
                    }
                }
            
            proposals_list.append(proposal_data)
        
        return proposals_list
        
    except Exception as e:
        import traceback
        print(f"❌ Error in list_proposals: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to list proposals: {str(e)}")

# --- Vote endpoint ---
@app.post("/votes")
def add_vote(v: VoteIn, db: Session = Depends(get_db)):
    try:
        # Registrar no sistema ponderado do SuperNova se disponível
        if SUPER_NOVA_AVAILABLE:
            try:
                register_vote_result = register_vote(
                    proposal_id=v.proposal_id,
                    voter=v.voter,
                    choice=v.choice,
                    species=v.voter_type
                )
            except Exception as e:
                print(f"⚠️ Weighted voting failed: {e}")
                register_vote_result = {"ok": True, "note": "weighted system failed"}
        
        # Registrar no banco
        if SUPER_NOVA_AVAILABLE:
            # Verificar se voto já existe
            existing_vote = db.query(ProposalVote).filter(
                ProposalVote.proposal_id == v.proposal_id,
                ProposalVote.voter == v.voter
            ).first()
            
            if existing_vote:
                existing_vote.choice = v.choice
                existing_vote.voter_type = v.voter_type
            else:
                vote = ProposalVote(
                    proposal_id=v.proposal_id,
                    voter=v.voter,
                    choice=v.choice,
                    voter_type=v.voter_type
                )
                db.add(vote)
        else:
            # SQL direto
            # Remover voto existente se houver
            db.execute(
                text("DELETE FROM votes WHERE proposal_id = :pid AND voter = :voter"),
                {"pid": v.proposal_id, "voter": v.voter}
            )
            # Inserir novo voto
            db.execute(
                text("INSERT INTO votes (proposal_id, voter, choice, voter_type) VALUES (:pid, :voter, :choice, :vtype)"),
                {"pid": v.proposal_id, "voter": v.voter, "choice": v.choice, "vtype": v.voter_type}
            )
        
        db.commit()
        return {"ok": True, "weighted_system": SUPER_NOVA_AVAILABLE}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to register vote: {str(e)}")

# --- Tally endpoints ---
@app.get("/proposals/{pid}/tally")
def tally(pid: int, db: Session = Depends(get_db)):
    try:
        weighted_result = {}
        if SUPER_NOVA_AVAILABLE:
            try:
                weighted_result = tally_votes(pid)
            except Exception as e:
                print(f"⚠️ Weighted tally failed: {e}")
        
        # Contagem tradicional
        if SUPER_NOVA_AVAILABLE:
            up_count = db.query(ProposalVote).filter(
                ProposalVote.proposal_id == pid, 
                ProposalVote.choice == "up"
            ).count()
            down_count = db.query(ProposalVote).filter(
                ProposalVote.proposal_id == pid, 
                ProposalVote.choice == "down"
            ).count()
        else:
            up_result = db.execute(
                text("SELECT COUNT(*) FROM votes WHERE proposal_id = :pid AND choice = 'up'"),
                {"pid": pid}
            )
            down_result = db.execute(
                text("SELECT COUNT(*) FROM votes WHERE proposal_id = :pid AND choice = 'down'"),
                {"pid": pid}
            )
            up_count = up_result.scalar() or 0
            down_count = down_result.scalar() or 0
        
        return {
            "up": up_count,
            "down": down_count,
            "weighted": weighted_result,
            "system": "unified"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to tally votes: {str(e)}")

@app.get("/proposals/{pid}/tally-weighted")
def tally_weighted(pid: int):
    if not SUPER_NOVA_AVAILABLE:
        raise HTTPException(status_code=501, detail="SuperNova weighted voting not available")
    return tally_votes(pid)

# --- Decision endpoint ---
@app.post("/decide/{pid}", response_model=DecisionSchema)
def decide(pid: int, threshold: float = 0.6, db: Session = Depends(get_db)):
    try:
        # Sistema ponderado
        weighted_decision = None
        if SUPER_NOVA_AVAILABLE:
            try:
                level = "important" if threshold >= 0.9 else "standard"
                weighted_decision = weighted_decide(pid, level)
                status = weighted_decision.get("status", "undecided")
            except Exception as e:
                print(f"⚠️ Weighted decision failed: {e}")
        
        # Fallback para sistema tradicional
        if not weighted_decision:
            tally_result = tally(pid, db)
            total = tally_result["up"] + tally_result["down"]
            status = "rejected"
            if total > 0 and (tally_result["up"] / total) >= threshold:
                status = "accepted"
        
        # Salvar decisão
        if SUPER_NOVA_AVAILABLE:
            existing = db.query(Decision).filter(Decision.proposal_id == pid).first()
            if existing:
                existing.status = status
            else:
                decision = Decision(proposal_id=pid, status=status)
                db.add(decision)
        else:
            existing = db.execute(
                text("SELECT * FROM decisions WHERE proposal_id = :pid"),
                {"pid": pid}
            ).fetchone()
            
            if existing:
                db.execute(
                    text("UPDATE decisions SET status = :status WHERE id = :id"),
                    {"status": status, "id": existing.id}
                )
            else:
                db.execute(
                    text("INSERT INTO decisions (proposal_id, status) VALUES (:pid, :status)"),
                    {"pid": pid, "status": status}
                )
        
        db.commit()
        
        # Retornar decisão
        if SUPER_NOVA_AVAILABLE:
            decision_obj = db.query(Decision).filter(Decision.proposal_id == pid).first()
            return DecisionSchema(
                id=decision_obj.id,
                proposal_id=decision_obj.proposal_id,
                status=decision_obj.status
            )
        else:
            decision_obj = db.execute(
                text("SELECT * FROM decisions WHERE proposal_id = :pid"),
                {"pid": pid}
            ).fetchone()
            return DecisionSchema(
                id=decision_obj.id,
                proposal_id=decision_obj.proposal_id,
                status=decision_obj.status
            )
            
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to save decision: {str(e)}")

# --- Comment endpoint ---
@app.post("/comments")
def add_comment(c: CommentIn, db: Session = Depends(get_db)):
    try:
        if SUPER_NOVA_AVAILABLE:
            comment = Comment(
                proposal_id=c.proposal_id,
                user=c.user or "Anonymous",
                user_img=c.user_img or "/uploads/default_avatar.png",
                comment=c.comment
            )
            db.add(comment)
        else:
            db.execute(
                text("INSERT INTO comments (proposal_id, user, user_img, comment) VALUES (:pid, :user, :user_img, :comment)"),
                {
                    "pid": c.proposal_id, 
                    "user": c.user or "Anonymous",
                    "user_img": c.user_img or "/uploads/default_avatar.png",
                    "comment": c.comment
                }
            )
        
        db.commit()
        return {"ok": True}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to add comment: {str(e)}")

# --- Karma endpoint ---
@app.get("/users/{username}/karma")
def get_user_karma(username: str, db: Session = Depends(get_db)):
    if not SUPER_NOVA_AVAILABLE:
        raise HTTPException(status_code=501, detail="Karma system not available")
    
    user = db.query(Harmonizer).filter(Harmonizer.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "username": user.username,
        "karma": float(user.karma_score),
        "harmony_score": float(user.harmony_score),
        "creative_spark": float(user.creative_spark),
        "species": user.species,
        "network_centrality": user.network_centrality
    }

# --- Restante dos endpoints (mantidos da sua versão) ---
@app.get("/decisions", response_model=List[DecisionSchema])
def list_decisions(db: Session = Depends(get_db)):
    if SUPER_NOVA_AVAILABLE:
        decisions = db.query(Decision).order_by(Decision.id.desc()).all()
        return [DecisionSchema(id=d.id, proposal_id=d.proposal_id, status=d.status) for d in decisions]
    else:
        result = db.execute(text("SELECT * FROM decisions ORDER BY id DESC"))
        return [DecisionSchema(id=d.id, proposal_id=d.proposal_id, status=d.status) for d in result.fetchall()]

@app.post("/runs", response_model=RunSchema)
def create_run(decision_id: int, db: Session = Depends(get_db)):
    try:
        if SUPER_NOVA_AVAILABLE:
            run = Run(decision_id=decision_id, status="done")
            db.add(run)
        else:
            db.execute(
                text("INSERT INTO runs (decision_id, status) VALUES (:did, 'done')"),
                {"did": decision_id}
            )
        
        db.commit()
        
        if SUPER_NOVA_AVAILABLE:
            db.refresh(run)
            return RunSchema(id=run.id, decision_id=run.decision_id, status=run.status)
        else:
            result = db.execute(
                text("SELECT * FROM runs WHERE decision_id = :did ORDER BY id DESC LIMIT 1"),
                {"did": decision_id}
            )
            row = result.fetchone()
            return RunSchema(id=row.id, decision_id=row.decision_id, status=row.status)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create run: {str(e)}")

@app.get("/runs", response_model=List[RunSchema])
def list_runs(db: Session = Depends(get_db)):
    if SUPER_NOVA_AVAILABLE:
        runs = db.query(Run).order_by(Run.id.desc()).all()
        return [RunSchema(id=r.id, decision_id=r.decision_id, status=r.status) for r in runs]
    else:
        result = db.execute(text("SELECT * FROM runs ORDER BY id DESC"))
        return [RunSchema(id=r.id, decision_id=r.decision_id, status=r.status) for r in result.fetchall()]

@app.get("/proposals/{pid}", response_model=ProposalSchema)
def get_proposal(pid: int, db: Session = Depends(get_db)):
    if SUPER_NOVA_AVAILABLE:
        row = db.query(Proposal).filter(Proposal.id == pid).first()
        if not row:
            raise HTTPException(status_code=404, detail="Proposal not found")
        
        votes = db.query(ProposalVote).filter(ProposalVote.proposal_id == pid).all()
        likes = [{"voter": v.voter, "type": v.voter_type} for v in votes if v.choice == "up"]
        dislikes = [{"voter": v.voter, "type": v.voter_type} for v in votes if v.choice == "down"]
        
        comments = db.query(Comment).filter(Comment.proposal_id == pid).all()
        comments_list = [{"proposal_id": c.proposal_id, "user": c.user, "user_img": c.user_img, "comment": c.comment} for c in comments]
        
        return ProposalSchema(
            id=row.id,
            title=row.title,
            text=row.description,
            userName=row.author_username,
            userInitials=(row.author_username[:2]).upper() if row.author_username else "",
            author_img=row.author_img,
            time=row.created_at.isoformat() if row.created_at else "",
            author_type=row.author_type,
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
    else:
        result = db.execute(
            text("SELECT * FROM proposals WHERE id = :pid"),
            {"pid": pid}
        )
        row = result.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Proposal not found")
        
        votes_result = db.execute(
            text("SELECT * FROM votes WHERE proposal_id = :pid"),
            {"pid": pid}
        )
        votes = votes_result.fetchall()
        likes = [{"voter": v.voter, "type": v.voter_type} for v in votes if v.choice == "up"]
        dislikes = [{"voter": v.voter, "type": v.voter_type} for v in votes if v.choice == "down"]
        
        comments_result = db.execute(
            text("SELECT * FROM comments WHERE proposal_id = :pid"),
            {"pid": pid}
        )
        comments = comments_result.fetchall()
        comments_list = [{"proposal_id": c.proposal_id, "user": c.user, "user_img": c.user_img, "comment": c.comment} for c in comments]
        
        return ProposalSchema(
            id=row.id,
            title=row.title,
            text=row.body,
            userName=row.author,
            userInitials=(row.author[:2]).upper() if row.author else "",
            author_img=row.author_img,
            time=row.date,
            author_type=row.author_type,
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

# --- Upload endpoints ---
@app.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    os.makedirs(uploads_dir, exist_ok=True)
    ext = os.path.splitext(file.filename)[1]
    unique_name = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(uploads_dir, unique_name)
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    return {"filename": unique_name, "url": f"/uploads/{unique_name}"}

@app.post("/upload-file")
async def upload_file(file: UploadFile = File(...)):
    os.makedirs(uploads_dir, exist_ok=True)
    ext = os.path.splitext(file.filename)[1]
    unique_name = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(uploads_dir, unique_name)
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    return {"filename": unique_name, "url": f"/uploads/{unique_name}"}

# --- Delete endpoints ---
@app.delete("/proposals/{pid}")
def delete_proposal(pid: int, db: Session = Depends(get_db)):
    try:
        if SUPER_NOVA_AVAILABLE:
            db.query(Comment).filter(Comment.proposal_id == pid).delete()
            db.query(ProposalVote).filter(ProposalVote.proposal_id == pid).delete()
            db.query(Proposal).filter(Proposal.id == pid).delete()
        else:
            db.execute(text("DELETE FROM comments WHERE proposal_id = :pid"), {"pid": pid})
            db.execute(text("DELETE FROM votes WHERE proposal_id = :pid"), {"pid": pid})
            db.execute(text("DELETE FROM proposals WHERE id = :pid"), {"pid": pid})
        
        db.commit()
        return {"ok": True, "deleted_id": pid}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete proposal: {str(e)}")

@app.delete("/proposals")
def delete_all_proposals(db: Session = Depends(get_db)):
    try:
        if SUPER_NOVA_AVAILABLE:
            db.query(Comment).delete()
            db.query(ProposalVote).delete()
            deleted_count = db.query(Proposal).delete()
        else:
            db.execute(text("DELETE FROM comments"))
            db.execute(text("DELETE FROM votes"))
            result = db.execute(text("DELETE FROM proposals"))
            deleted_count = result.rowcount
        
        db.commit()
        return {"ok": True, "deleted_count": deleted_count}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete all proposals: {str(e)}")

@app.delete("/votes")
def remove_vote(proposal_id: int, voter: str, db: Session = Depends(get_db)):
    try:
        if SUPER_NOVA_AVAILABLE:
            deleted_count = db.query(ProposalVote).filter(
                ProposalVote.proposal_id == proposal_id,
                ProposalVote.voter == voter
            ).delete()
        else:
            result = db.execute(
                text("DELETE FROM votes WHERE proposal_id = :pid AND voter = :voter"),
                {"pid": proposal_id, "voter": voter}
            )
            deleted_count = result.rowcount
        
        db.commit()
        if deleted_count == 0:
            raise HTTPException(status_code=404, detail="Vote not found")
        return {"ok": True, "removed": deleted_count}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to remove vote: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)