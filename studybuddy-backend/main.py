from fastapi import FastAPI, Depends, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import requests
import httpx
import json

from database import engine, get_db, Base
from models import User, Conversation, Message
from auth import (
    hash_password,
    verify_password,
    create_access_token,
    verify_token
)

# ──────────────────────────────────────────────────────
# DATABASE
# ──────────────────────────────────────────────────────

Base.metadata.create_all(bind=engine)

# ──────────────────────────────────────────────────────
# APP
# ──────────────────────────────────────────────────────

app = FastAPI(
    title="StudyBuddy API",
    version="1.0.0"
)

# ──────────────────────────────────────────────────────
# CORS
# ──────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ──────────────────────────────────────────────────────
# SECURITY
# ──────────────────────────────────────────────────────

security = HTTPBearer()

# ──────────────────────────────────────────────────────
# N8N URLS
# ──────────────────────────────────────────────────────

N8N_WEBHOOK_URL = "https://sttudybuddy.app.n8n.cloud/webhook/study-buddy"

N8N_UPLOAD_URL = "https://sttudybuddy.app.n8n.cloud/webhook/rag-ingestion"

# ──────────────────────────────────────────────────────
# SCHEMAS
# ──────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class ChatRequest(BaseModel):
    conversation_id: Optional[int] = None
    question: str
    file_name: Optional[str] = None


class ConversationResponse(BaseModel):
    id: int
    title: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    id: int
    role: str
    content: str
    mode: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# ──────────────────────────────────────────────────────
# HELPERS
# ──────────────────────────────────────────────────────

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:

    payload = verify_token(credentials.credentials)

    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Token invalide ou expiré"
        )

    user = db.query(User).filter(
        User.email == payload.get("sub")
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Utilisateur non trouvé"
        )

    return user


def call_n8n(
    question: str,
    session_id: str,
    email: str,
    name: str,
    file_name: str = ""
) -> dict:

    try:
        response = requests.post(
            N8N_WEBHOOK_URL,
            json={
                "question": question,
                "sessionId": session_id,
                "email": email,
                "name": name,
                "fileName": file_name
            },
            timeout=90,
            headers={
                "Content-Type": "application/json"
            }
        )

        # réponse vide
        if not response.text or response.text.strip() == "":
            return {
                "text": "[MODE: FALLBACK]\nLe service IA est temporairement indisponible.",
                "mode": "FALLBACK",
                "success": False
            }

        # essayer JSON
        try:
            data = response.json()
            return data

        except json.JSONDecodeError:
            return {
                "text": f"[MODE: FALLBACK]\n{response.text[:500]}",
                "mode": "FALLBACK",
                "success": False
            }

    except requests.exceptions.Timeout:
        return {
            "text": "[MODE: FALLBACK]\nLe service a mis trop de temps à répondre.",
            "mode": "FALLBACK",
            "success": False
        }

    except requests.exceptions.ConnectionError:
        return {
            "text": "[MODE: FALLBACK]\nImpossible de contacter le service IA.",
            "mode": "FALLBACK",
            "success": False
        }

    except Exception as e:
        return {
            "text": f"[MODE: FALLBACK]\nErreur inattendue : {str(e)}",
            "mode": "FALLBACK",
            "success": False
        }

# ──────────────────────────────────────────────────────
# AUTH ROUTES
# ──────────────────────────────────────────────────────

@app.post("/auth/register")
def register(
    request: RegisterRequest,
    db: Session = Depends(get_db)
):

    existing = db.query(User).filter(
        User.email == request.email
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email déjà utilisé"
        )

    user = User(
        name=request.name,
        email=request.email,
        password_hash=hash_password(request.password)
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({
        "sub": user.email
    })

    return {
        "success": True,
        "message": "Compte créé avec succès",
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }


@app.post("/auth/login")
def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.email == request.email
    ).first()

    if not user or not verify_password(
        request.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Email ou mot de passe incorrect"
        )

    token = create_access_token({
        "sub": user.email
    })

    return {
        "success": True,
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }


@app.get("/auth/me")
def get_me(
    current_user: User = Depends(get_current_user)
):

    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "created_at": current_user.created_at
    }

# ──────────────────────────────────────────────────────
# CONVERSATIONS
# ──────────────────────────────────────────────────────

@app.get(
    "/conversations",
    response_model=List[ConversationResponse]
)
def get_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    return db.query(Conversation)\
        .filter(
            Conversation.user_id == current_user.id
        )\
        .order_by(
            Conversation.updated_at.desc()
        )\
        .all()


@app.get(
    "/conversations/{conversation_id}/messages",
    response_model=List[MessageResponse]
)
def get_messages(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    conv = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()

    if not conv:
        raise HTTPException(
            status_code=404,
            detail="Conversation non trouvée"
        )

    return db.query(Message)\
        .filter(
            Message.conversation_id == conversation_id
        )\
        .order_by(
            Message.created_at.asc()
        )\
        .all()


@app.delete("/conversations/{conversation_id}")
def delete_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    conv = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()

    if not conv:
        raise HTTPException(
            status_code=404,
            detail="Conversation non trouvée"
        )

    db.query(Message).filter(
        Message.conversation_id == conversation_id
    ).delete()

    db.delete(conv)

    db.commit()

    return {
        "success": True,
        "message": "Conversation supprimée"
    }

# ──────────────────────────────────────────────────────
# CHAT
# ──────────────────────────────────────────────────────

@app.post("/chat")
def chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # conversation existante
    if request.conversation_id:

        conv = db.query(Conversation).filter(
            Conversation.id == request.conversation_id,
            Conversation.user_id == current_user.id
        ).first()

        if not conv:
            raise HTTPException(
                status_code=404,
                detail="Conversation non trouvée"
            )

    # nouvelle conversation
    else:

        title = (
            request.question[:50] + "..."
            if len(request.question) > 50
            else request.question
        )

        conv = Conversation(
            user_id=current_user.id,
            title=title
        )

        db.add(conv)
        db.commit()
        db.refresh(conv)

        

    # message utilisateur
    user_msg = Message(
        conversation_id=conv.id,
        role="user",
        content=request.question
    )

    db.add(user_msg)
    db.commit()

    # appel n8n
    data = call_n8n(
        question=request.question,
        session_id=f"user-{current_user.id}-conv-{conv.id}",
        email=current_user.email,
        name=current_user.name,
       file_name=request.file_name or ""
    )

    print("\n====================")
    print("DATA N8N =", data)
    print("====================\n")

    mode = data.get("mode", "SOCRATIQUE").lstrip("=").strip().upper()

    bot_text = data.get(
        "text",
        "Désolé, une erreur s'est produite."
    )

    questions = data.get("questions", [])

    # ─────────────────────────────
    # CORRECTION QUIZ
    # ─────────────────────────────

    if mode == "QUIZ":

        # si questions est une string JSON
        if isinstance(questions, str):

            try:
                questions = json.loads(questions)

            except Exception:
                questions = []

        # sécurité
        if not isinstance(questions, list):
            questions = []

        print("QUESTIONS =", questions)

        bot_text = json.dumps(
            questions,
            ensure_ascii=False
        )

    # sauvegarde message bot
    bot_msg = Message(
        conversation_id=conv.id,
        role="bot",
        content=bot_text,
        mode=mode
    )

    db.add(bot_msg)

    conv.updated_at = datetime.utcnow()

    db.commit()

    return {
        "success": True,
        "conversation_id": conv.id,
        "mode": mode,
        "text": bot_text,
        "questions": questions
    }

# ──────────────────────────────────────────────────────
# UPLOAD
# ──────────────────────────────────────────────────────

@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    try:

        file_bytes = await file.read()

        async with httpx.AsyncClient(timeout=120) as client:

            response = await client.post(
                N8N_UPLOAD_URL,
                files={
                    "file": (
                        file.filename,
                        file_bytes,
                        file.content_type
                    )
                },
                data={
                    "fileName": file.filename,
                    "userEmail": current_user.email,
                    "sessionId": f"user-{current_user.id}"
                }
            )

        if response.status_code == 200:

            return {
                "success": True,
                "message": f"'{file.filename}' chargé avec succès",
                "file_name": file.filename
            }

        else:

            return {
                "success": False,
                "message": f"Erreur n8n : {response.status_code}"
            }

    except httpx.TimeoutException:

        return {
            "success": False,
            "message": "Timeout — n8n a mis trop de temps"
        }

    except Exception as e:

        return {
            "success": False,
            "message": str(e)
        }

# ──────────────────────────────────────────────────────
# HEALTH
# ──────────────────────────────────────────────────────

@app.get("/")
def root():

    return {
        "message": "StudyBuddy API fonctionne !",
        "version": "1.0.0"
    }


@app.get("/health")
def health():

    return {
        "status": "ok",
        "timestamp": datetime.utcnow()
    }

