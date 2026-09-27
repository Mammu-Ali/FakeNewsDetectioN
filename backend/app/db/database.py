import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv
import logging

load_dotenv()

logger = logging.getLogger(__name__)

# Fallback to SQLite for development/testing when PostgreSQL is unavailable
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./truthguard_dev.db"
)

# Strip surrounding quotes that may be present in .env values
if SQLALCHEMY_DATABASE_URL.startswith('"') and SQLALCHEMY_DATABASE_URL.endswith('"'):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL[1:-1]

# Render supplies connection strings starting with 'postgres://' which SQLAlchemy does not support directly.
# Translate 'postgres://' to 'postgresql+psycopg://' (if psycopg 3 is installed) or 'postgresql://'.
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    try:
        import psycopg  # noqa
        SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)
    except ImportError:
        SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)
elif SQLALCHEMY_DATABASE_URL.startswith("postgresql://") and not SQLALCHEMY_DATABASE_URL.startswith("postgresql+"):
    try:
        import psycopg  # noqa
        SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)
    except ImportError:
        pass

# SQLite needs special connect_args
connect_args = {}
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    logger.warning("Using SQLite fallback. Configure DATABASE_URL in backend/.env to use PostgreSQL.")

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
