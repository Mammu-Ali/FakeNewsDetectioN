from pydantic import BaseModel, Field, field_validator
from typing import List, Optional


class PredictionRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000, description="The news article text to analyze")
    user_id: Optional[str] = None

    @field_validator("text")
    @classmethod
    def text_must_not_be_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("text must not be blank or whitespace-only")
        return v


class PredictionResponse(BaseModel):
    prediction: str
    confidence: float
    keywords: List[str]
    explanation: str
    explanation_status: str
    model_name: str
    model_version: str
    demo: bool
    inference_time_ms: int
