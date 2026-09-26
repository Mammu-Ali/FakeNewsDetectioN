from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.db import crud, schemas
from app.db.database import get_db

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
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    filter: Optional[str] = Query(None, description="Filter by REAL or FAKE"),
    search: Optional[str] = Query(None, description="Search in text"),
    sort: Optional[str] = Query("newest", description="Sort by newest or oldest"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    """Get prediction history. user_id is required to enforce user isolation."""
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id query parameter is required")

    predictions = crud.get_predictions_by_user(db, user_id=user_id, skip=skip, limit=limit)
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
    user_id: Optional[str] = Query(None, description="User ID for ownership check"),
    db: Session = Depends(get_db),
):
    """Get a specific prediction. Enforces user isolation."""
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id query parameter is required")

    pred = crud.get_prediction(db, prediction_id)
    if not pred:
        raise HTTPException(status_code=404, detail="Prediction not found")

    # Enforce user isolation
    if pred.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    return _format_prediction(pred)


@router.delete("/{prediction_id}")
async def delete_history_item(
    prediction_id: str,
    user_id: Optional[str] = Query(None, description="User ID for ownership check"),
    db: Session = Depends(get_db),
):
    """Delete a specific prediction. Enforces user isolation."""
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id query parameter is required")

    pred = crud.get_prediction(db, prediction_id)
    if not pred:
        raise HTTPException(status_code=404, detail="Prediction not found")

    if pred.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    crud.delete_prediction(db, prediction_id)
    return {"message": "Prediction deleted successfully"}


@router.delete("")
async def clear_history(
    user_id: Optional[str] = Query(None, description="User ID"),
    db: Session = Depends(get_db),
):
    """Delete all predictions for the current user."""
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id query parameter is required")

    crud.delete_all_user_predictions(db, user_id)
    return {"message": "Prediction history cleared"}
