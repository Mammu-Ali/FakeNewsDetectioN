from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging

from app.core.config import settings
from app.core.errors import (
    validation_exception_handler,
    http_exception_handler,
    global_exception_handler
)

from app.api import auth, prediction, history, dataset, model, performance
from app.ml.inference import inference_service

logger = logging.getLogger(__name__)


def _init_database():
    """Create DB tables on startup. Fails fast in production if DB is unreachable."""
    try:
        from app.db.database import Base, engine
        from app.db import models  # noqa – ensure models are imported before create_all
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables ensured/created successfully.")
    except Exception as exc:
        if settings.ENVIRONMENT == "production":
            logger.critical(f"FATAL: Database initialisation failed in production: {exc}")
            raise RuntimeError(f"Database initialisation failed: {exc}") from exc
        logger.warning(f"Database initialisation skipped (PostgreSQL not available?): {exc}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    _init_database()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered fake news detection backend.",
    version=settings.APP_VERSION,
    lifespan=lifespan,
)

# CORS Configuration
configured_origins = [
    settings.FRONTEND_URL.rstrip("/"),
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://truthguard.vercel.app",
    "https://fakenewsdetection-1-4iyd.onrender.com",
]
unique_origins = list(dict.fromkeys([o for o in configured_origins if o]))

app.add_middleware(
    CORSMiddleware,
    allow_origins=unique_origins,
    allow_origin_regex=r"https:\/\/.*\.onrender\.com|https:\/\/.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception Handlers
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(Exception, global_exception_handler)

# Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(prediction.router, prefix="/api/predict", tags=["Prediction"])
app.include_router(history.router, prefix="/api/history", tags=["History"])
app.include_router(dataset.router, prefix="/api/datasets", tags=["Dataset"])
app.include_router(model.router, prefix="/api/models", tags=["Model"])
app.include_router(performance.router, prefix="/api/performance", tags=["Performance"])


@app.get("/", tags=["Health"])
async def root():
    return {
        "message": f"{settings.APP_NAME} is running",
        "version": settings.APP_VERSION,
        "status": "online"
    }


@app.get("/api/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": inference_service.is_loaded(),
        "model_name": inference_service.model_name
    }
