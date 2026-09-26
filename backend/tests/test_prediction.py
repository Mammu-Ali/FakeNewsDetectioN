import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.ml.inference import inference_service

client = TestClient(app)

def test_empty_text():
    response = client.post("/api/predict", json={"text": ""})
    # FastAPI Pydantic validation handles min_length=10
    assert response.status_code == 422 

def test_very_long_text():
    # max_length is 5000 in schema
    long_text = "word " * 1200
    response = client.post("/api/predict", json={"text": long_text})
    assert response.status_code == 422

def test_model_loading(mocker):
    # Simply test that load_model executes without throwing unexpected errors
    # It might log a warning if model doesn't exist but shouldn't crash
    inference_service.load_model()
    
def test_api_response_structure(mocker):
    # Mock inference to avoid loading full PyTorch model during fast unit tests
    mocker.patch('app.ml.inference.inference_service.predict', return_value={
        "prediction": "FAKE",
        "confidence": 0.92,
        "keywords": ["test", "words"],
        "explanation": "Predicted using trained model confidence.",
        "explanation_status": "basic",
        "model_name": "BERT Fake News Classifier",
        "model_version": "1.0.0",
        "demo": False,
        "inference_time_ms": 120
    })
    
    valid_text = "This is a completely valid fake news article for testing."
    response = client.post("/api/predict", json={"text": valid_text})
    
    assert response.status_code == 200
    data = response.json()
    assert "prediction" in data
    assert "confidence" in data
    assert "keywords" in data
    assert "inference_time_ms" in data
    assert data["demo"] is False
    assert data["prediction"] == "FAKE"

def test_valid_real_article(mocker):
    mocker.patch('app.ml.inference.inference_service.predict', return_value={
        "prediction": "REAL",
        "confidence": 0.88,
        "keywords": [],
        "explanation": "Predicted using trained model confidence.",
        "explanation_status": "basic",
        "model_name": "BERT Fake News Classifier",
        "model_version": "1.0.0",
        "demo": False,
        "inference_time_ms": 150
    })
    
    valid_text = "This is a factual and verifiable news article."
    response = client.post("/api/predict", json={"text": valid_text})
    
    assert response.status_code == 200
    data = response.json()
    assert data["prediction"] == "REAL"
    assert data["confidence"] == 0.88
