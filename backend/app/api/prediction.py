from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Optional
from app.schemas.prediction import PredictionRequest, PredictionResponse
from app.ml.inference import inference_service
from app.db import crud, schemas, models
from app.db.database import get_db
from app.dependencies import get_current_user_optional
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("", response_model=PredictionResponse)
async def predict(
    request: PredictionRequest,
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    try:
        if not request.text or not request.text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        result = inference_service.predict(request.text)
        
        # Save to database only if authenticated via JWT (prevents IDOR / user spoofing)
        # Never trust an unverified user_id from the client payload
        effective_user_id = current_user.id if current_user else None
        
        if effective_user_id:
            try:
                crud.create_prediction(
                    db,
                    schemas.PredictionCreate(
                        text=request.text,
                        prediction=result.get("prediction"),
                        confidence=result.get("confidence"),
                        model_name=result.get("model_name"),
                        model_version=result.get("model_version"),
                        inference_time_ms=result.get("inference_time_ms"),
                        user_id=effective_user_id
                    )
                )
            except Exception as db_err:
                logger.error(f"Failed to save prediction to DB: {db_err}")
                # We still return the prediction even if DB save fails

        return result
    except ValueError as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=503, detail="Prediction service unavailable. Model could not be loaded.")
    except Exception as e:
        logger.error(f"Unexpected prediction error: {e}")
        raise HTTPException(status_code=500, detail="An error occurred during prediction.")
