from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import initialize_database, use_mongo
from app.routers import users, analysis, chatbot, reports

# Setup FastAPI App
app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Multi-Modal Mental Health Analyser - Academic Edition"
)

# CORS Middleware config
# Allow local development frontend and other local test origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup DB Event
@app.on_event("startup")
async def startup_db_client():
    initialize_database()

# Include Routers
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(analysis.router, prefix=settings.API_V1_STR)
app.include_router(chatbot.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "status": "online",
        "project": settings.PROJECT_NAME,
        "database": "MongoDB Atlas" if use_mongo else "Local JSON Fallback Store",
        "version": "1.0.0"
    }
