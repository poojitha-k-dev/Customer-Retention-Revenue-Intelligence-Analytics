"""Configuration module for Customer Retention & Revenue Intelligence Platform.

Handles paths, environment variables, database connections, and logging.
"""

import os
import sys
from pathlib import Path
import logging
from sqlalchemy import create_engine

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

DATA_DIR = BASE_DIR / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
PROCESSED_DATA_DIR = DATA_DIR / "processed"
SQL_DIR = BASE_DIR / "sql"
REPORTS_DIR = BASE_DIR / "reports"
NOTEBOOKS_DIR = BASE_DIR / "notebooks"
DASHBOARD_DIR = BASE_DIR / "dashboard"

# Ensure directories exist
for path in [RAW_DATA_DIR, PROCESSED_DATA_DIR, SQL_DIR, REPORTS_DIR, NOTEBOOKS_DIR, DASHBOARD_DIR]:
    path.mkdir(parents=True, exist_ok=True)

# Parse .env manually if dotenv not loaded
def load_env():
    env_file = BASE_DIR / ".env"
    if env_file.exists():
        with open(env_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, value = line.split("=", 1)
                    os.environ.setdefault(key.strip(), value.strip())

load_env()

# Database settings
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "olist_db")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")

# Database URLs
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
POSTGRES_ADMIN_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/postgres"

def get_engine(admin: bool = False):
    """Return SQLAlchemy engine."""
    url = POSTGRES_ADMIN_URL if admin else DATABASE_URL
    return create_engine(url)

# Logging configuration
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL, logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("olist_analytics")
