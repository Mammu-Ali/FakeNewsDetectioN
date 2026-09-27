import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Boolean, Index
from sqlalchemy.orm import relationship
from .database import Base

def generate_uuid():
    return str(uuid.uuid4())

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="user")
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    predictions = relationship("Prediction", back_populates="user", cascade="all, delete-orphan")


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    text = Column(String, nullable=False)
    prediction = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    model_name = Column(String, nullable=False)
    model_version = Column(String, nullable=False)
    inference_time_ms = Column(Float, nullable=False)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="predictions")

    __table_args__ = (
        Index("ix_predictions_user_created", "user_id", "created_at"),
    )


class MLModel(Base):
    __tablename__ = "models"

    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    name = Column(String, nullable=False)
    version = Column(String, nullable=False)
    status = Column(String, nullable=False)
    model_path = Column(String, nullable=False)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    evaluations = relationship("Evaluation", back_populates="model", cascade="all, delete-orphan")


class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    name = Column(String, nullable=False)
    filename = Column(String, nullable=False)
    total_rows = Column(Integer, nullable=False)
    real_count = Column(Integer, nullable=False)
    fake_count = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=utc_now)

    evaluations = relationship("Evaluation", back_populates="dataset", cascade="all, delete-orphan")


class Evaluation(Base):
    __tablename__ = "evaluations"

    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    model_id = Column(String, ForeignKey("models.id"), nullable=False, index=True)
    dataset_id = Column(String, ForeignKey("datasets.id"), nullable=False, index=True)
    accuracy = Column(Float, nullable=False)
    precision = Column(Float, nullable=False)
    recall = Column(Float, nullable=False)
    f1 = Column(Float, nullable=False)
    test_samples = Column(Integer, nullable=False)
    evaluated_at = Column(DateTime, default=utc_now)

    model = relationship("MLModel", back_populates="evaluations")
    dataset = relationship("Dataset", back_populates="evaluations")
