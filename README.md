# StudyBuddy AI 🎓

Tuteur IA pédagogique basé sur RAG (Retrieval-Augmented Generation)

## Architecture

```
studybuddy-frontend/     ← Interface React
studybuddy-backend/      ← API FastAPI (Python)
workflows/               ← Workflows n8n (JSON)
notebooks/               ← Notebooks Jupyter (.ipynb)
```

## Stack Technique

| Composant | Technologie |
|-----------|------------|
| Frontend | React + Vite |
| Backend | FastAPI (Python) |
| Orchestration IA | n8n Cloud |
| Vector Store | Pinecone |
| LLM | Google Gemini |
| Base de données | SQLite |

## Fonctionnalités

- 📎 Upload de cours (PDF, DOCX, PPTX, TXT, Images)
- 🧠 Mode Socratique (questions guidées)
- 📝 Génération de Quiz QCM interactif
- 📋 Résumé automatique (fiche mémo)
- ✅ Évaluation des réponses
- 📧 Envoi automatique par email

## Installation

### Backend
```bash
cd studybuddy-backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd studybuddy-frontend
npm install
npm run dev
```

## Workflows n8n

Importer les fichiers JSON dans n8n :
- `workflows/Study-Buddy-Chat.json` → Workflow principal (chat)
- `workflows/RAG-Ingestion.json` → Workflow d'ingestion des documents

## Notebooks Jupyter

Les notebooks dans `notebooks/` contiennent l'implémentation technique du pipeline RAG :
- `evaluation.ipynb` → Évaluation des performances du système RAG
- `ingestion.ipynb` → Pipeline d'ingestion et indexation des documents
- `rag_pipeline.ipynb` → Pipeline complet RAG (retrieval + génération)

## Variables d'environnement

Créer un fichier `.env` dans `studybuddy-backend/` :
```
SECRET_KEY=votre_secret_key
N8N_WEBHOOK_URL=https://votre-instance.n8n.cloud/webhook/study-buddy
N8N_UPLOAD_URL=https://votre-instance.n8n.cloud/webhook/rag-ingestion
```