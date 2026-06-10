import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "Mental Health Analyser"
    API_V1_STR: str = "/api/v1"
    
    # JWT Auth Settings
    JWT_SECRET: str = os.getenv("JWT_SECRET", "supersecretkeyformentalhealthanalyser2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    
    # Database Settings
    MONGODB_URL: str = os.getenv("MONGODB_URL", "")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "mental_health_db")
    
    # Force use local/in-memory JSON DB (fallback) if MONGODB_URL is empty or cannot connect
    USE_IN_MEMORY_DB: bool = os.getenv("USE_IN_MEMORY_DB", "true").lower() == "true"

settings = Settings()
