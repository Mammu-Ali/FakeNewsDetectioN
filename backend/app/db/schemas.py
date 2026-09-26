from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime

# USER SCHEMAS
class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str = "user"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    created_at: datetime

# PREDICTION SCHEMAS
class PredictionBase(BaseModel):
    text: str
    prediction: str
    confidence: float
    model_name: str
    model_version: str
    inference_time_ms: float

class PredictionCreate(PredictionBase):
    user_id: str

class PredictionResponse(PredictionBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    created_at: datetime

# MODEL SCHEMAS
class MLModelBase(BaseModel):
    name: str
    version: str
    status: str
    model_path: str

class MLModelCreate(MLModelBase):
    pass

class MLModelResponse(MLModelBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    created_at: datetime
    updated_at: datetime

# DATASET SCHEMAS
class DatasetBase(BaseModel):
    name: str
    filename: str
    total_rows: int
    real_count: int
    fake_count: int

class DatasetCreate(DatasetBase):
    pass

class DatasetResponse(DatasetBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    created_at: datetime

# EVALUATION SCHEMAS
class EvaluationBase(BaseModel):
    model_id: str
    dataset_id: str
    accuracy: float
    precision: float
    recall: float
    f1: float
    test_samples: int

class EvaluationCreate(EvaluationBase):
    pass

class EvaluationResponse(EvaluationBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    evaluated_at: datetime
    model: Optional[MLModelResponse] = None
    dataset: Optional[DatasetResponse] = None
