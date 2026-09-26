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
    """Create DB tables on startup. Errors are logged but don't prevent server startup."""
    try:
        from app.db.database import Base, engine
        from app.db import models  # noqa – ensure models are imported before create_all
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables ensured/created successfully.")
    except Exception as exc:
        logger.warning(f"Database initialisation skipped (PostgreSQL not available?): {exc}")


app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered fake news detection backend.",
    version=settings.APP_VERSION,
)

# Register startup hook
@app.on_event("startup")
async def startup_event():
    _init_database()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL, 
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "https://truthguard.vercel.app"
    ],
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
