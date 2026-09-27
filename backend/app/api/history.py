from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.db import crud, schemas, models
from app.db.database import get_db
from app.dependencies import get_current_user

router = APIRouter()


def _format_prediction(pred) -> dict:
    """Convert SQLAlchemy Prediction object to API response dict."""
    return {
        "id": pred.id,
        "userId": pred.user_id,
        "text": pred.text,
        "prediction": pred.prediction,
        "confidence": round(pred.confidence * 100) if pred.confidence <= 1.0 else int(pred.confidence),
        "model_name": pred.model_name,
        "model_version": pred.model_version,
        "inference_time_ms": pred.inference_time_ms,
        "processingTime": f"{pred.inference_time_ms}ms",
        "createdAt": pred.created_at.isoformat() if pred.created_at else None,
        "isDemo": False,
    }


@router.get("")
async def get_history(
    user_id: Optional[str] = Query(None, description="Optional user ID filter (must match authenticated user)"),
    filter: Optional[str] = Query(None, description="Filter by REAL or FAKE"),
    search: Optional[str] = Query(None, description="Search in text"),
    sort: Optional[str] = Query("newest", description="Sort by newest or oldest"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get prediction history for the authenticated user.
    Prevents IDOR by strictly enforcing JWT ownership.
    """
    if user_id and user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot access prediction history of another user")

    predictions = crud.get_predictions_by_user(db, user_id=current_user.id, skip=skip, limit=limit)
    items = [_format_prediction(p) for p in predictions]

    # Filter by prediction label
    if filter and filter.upper() in ("REAL", "FAKE"):
        items = [i for i in items if i["prediction"] == filter.upper()]

    # Text search
    if search:
        search_lower = search.lower()
        items = [i for i in items if search_lower in i["text"].lower()]

    # Sort
    if sort == "oldest":
        items = sorted(items, key=lambda x: x["createdAt"] or "")
    else:
        items = sorted(items, key=lambda x: x["createdAt"] or "", reverse=True)

    return {"items": items, "total": len(items)}


@router.get("/{prediction_id}")
async def get_history_item(
    prediction_id: str,
    user_id: Optional[str] = Query(None, description="Optional user ID check"),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific prediction. Enforces JWT user ownership."""
    if user_id and user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    pred = crud.get_prediction(db, prediction_id)
    if not pred:
        raise HTTPException(status_code=404, detail="Prediction not found")

    # Enforce user isolation
    if pred.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    return _format_prediction(pred)


@router.delete("/{prediction_id}")
async def delete_history_item(
    prediction_id: str,
    user_id: Optional[str] = Query(None, description="Optional user ID check"),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a specific prediction. Enforces JWT user ownership."""
    if user_id and user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    pred = crud.get_prediction(db, prediction_id)
    if not pred:
        raise HTTPException(status_code=404, detail="Prediction not found")

    if pred.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    crud.delete_prediction(db, prediction_id)
    return {"message": "Prediction deleted successfully"}


@router.delete("")
async def clear_history(
    user_id: Optional[str] = Query(None, description="Optional user ID"),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete all predictions for the authenticated user."""
    if user_id and user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot clear prediction history of another user")

    crud.delete_all_user_predictions(db, current_user.id)
    return {"message": "Prediction history cleared"}
