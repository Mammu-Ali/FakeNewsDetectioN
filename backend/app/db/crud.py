from sqlalchemy.orm import Session
from . import models, schemas
import bcrypt

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

# USER CRUD
def get_user(db: Session, user_id: str):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        name=user.name,
        email=user.email,
        password_hash=hashed_password,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# PREDICTION CRUD
def create_prediction(db: Session, prediction: schemas.PredictionCreate):
    db_prediction = models.Prediction(**prediction.model_dump())
    db.add(db_prediction)
    db.commit()
    db.refresh(db_prediction)
    return db_prediction

from typing import Optional, List, Tuple

def get_predictions_by_user(
    db: Session,
    user_id: str,
    skip: int = 0,
    limit: int = 100,
    filter_label: Optional[str] = None,
    search: Optional[str] = None,
    sort: str = "newest",
    include_total: bool = False,
):
    query = db.query(models.Prediction).filter(models.Prediction.user_id == user_id)

    if filter_label and filter_label.upper() in ("REAL", "FAKE"):
        query = query.filter(models.Prediction.prediction == filter_label.upper())

    if search and search.strip():
        query = query.filter(models.Prediction.text.ilike(f"%{search.strip()}%"))

    total = query.count() if include_total else 0

    sort_normalized = sort.lower() if sort else "newest"
    if sort_normalized == "oldest":
        query = query.order_by(models.Prediction.created_at.asc())
    elif sort_normalized in ("highest_conf", "highest"):
        query = query.order_by(models.Prediction.confidence.desc())
    elif sort_normalized in ("lowest_conf", "lowest"):
        query = query.order_by(models.Prediction.confidence.asc())
    else:
        query = query.order_by(models.Prediction.created_at.desc())

    items = query.offset(skip).limit(limit).all()
    if include_total:
        return items, total
    return items

def get_prediction(db: Session, prediction_id: str):
    return db.query(models.Prediction).filter(models.Prediction.id == prediction_id).first()

def delete_prediction(db: Session, prediction_id: str):
    db_prediction = get_prediction(db, prediction_id)
    if db_prediction:
        db.delete(db_prediction)
        db.commit()
    return db_prediction

def delete_all_user_predictions(db: Session, user_id: str):
    db.query(models.Prediction).filter(models.Prediction.user_id == user_id).delete()
    db.commit()

# MODEL CRUD
def create_model(db: Session, model: schemas.MLModelCreate):
    db_model = models.MLModel(**model.model_dump())
    db.add(db_model)
    db.commit()
    db.refresh(db_model)
    return db_model

def get_models(db: Session):
    return db.query(models.MLModel).all()

def get_model_by_version(db: Session, version: str):
    return db.query(models.MLModel).filter(models.MLModel.version == version).first()

# DATASET CRUD
def create_dataset(db: Session, dataset: schemas.DatasetCreate):
    db_dataset = models.Dataset(**dataset.model_dump())
    db.add(db_dataset)
    db.commit()
    db.refresh(db_dataset)
    return db_dataset

def get_datasets(db: Session):
    return db.query(models.Dataset).all()

def get_dataset_by_name(db: Session, name: str):
    return db.query(models.Dataset).filter(models.Dataset.name == name).first()

# EVALUATION CRUD
def create_evaluation(db: Session, evaluation: schemas.EvaluationCreate):
    db_eval = models.Evaluation(**evaluation.model_dump())
    db.add(db_eval)
    db.commit()
    db.refresh(db_eval)
    return db_eval

def get_latest_evaluation(db: Session):
    return db.query(models.Evaluation).order_by(models.Evaluation.evaluated_at.desc()).first()
