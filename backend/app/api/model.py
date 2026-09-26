import os
import json
from fastapi import APIRouter

router = APIRouter()

# Resolve absolute paths -- this file is at backend/app/api/model.py
_THIS_DIR    = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(_THIS_DIR, "..", "..", ".."))

METADATA_PATH     = os.path.join(PROJECT_ROOT, "models", "bert_fake_news", "model_metadata.json")
EVAL_SUMMARY_PATH = os.path.join(PROJECT_ROOT, "training", "evaluation", "evaluation_summary.json")


def _load_json(path: str) -> dict:
    if os.path.isfile(path):
        with open(path) as f:
            return json.load(f)
    return {}


def load_metadata() -> dict:
    return _load_json(METADATA_PATH)


@router.get("")
async def get_models():
    meta      = load_metadata()
    eval_data = _load_json(EVAL_SUMMARY_PATH)
    status    = meta.get("status", "Not Trained")
    model = {
        "id":                "bert-fake-news-v1",
        "name":              meta.get("model_name", "BERT Fake News Classifier"),
        "version":           meta.get("version", "1.0.0"),
        "architecture":      "BERT + Classification Head",
        "framework":         "PyTorch",
        "provider":          "Hugging Face",
        "task":              "Binary Text Classification",
        "classes":           ["REAL", "FAKE"],
        "status":            status,
        "evaluationStatus":  meta.get("evaluation_status", "Evaluation Pending"),
        "datasetVersion":    "ISOT v1.0",
        "baseModel":         meta.get("base_model", "bert-base-uncased"),
        "trainingSamples":   meta.get("training_samples"),
        "validationSamples": meta.get("validation_samples"),
        "testSamples":       eval_data.get("test_dataset_size", meta.get("test_samples")),
        "trainingDate":      meta.get("training_date"),
        "evaluationDate":    eval_data.get("evaluation_date"),
        "device":            meta.get("device"),
        "metrics": {
            "accuracy":  eval_data.get("accuracy"),
            "precision": eval_data.get("precision"),
            "recall":    eval_data.get("recall"),
            "f1":        eval_data.get("f1_score"),
            "macro_f1":  eval_data.get("macro_f1"),
        } if eval_data else None,
    }
    return {"models": [model]}


@router.get("/status")
async def get_model_status():
    """Return merged model + evaluation data for the frontend."""
    meta      = load_metadata()
    eval_data = _load_json(EVAL_SUMMARY_PATH)
    return {
        "model_name":        meta.get("model_name", "BERT Fake News Classifier"),
        "version":           meta.get("version", "1.0.0"),
        "status":            "Evaluation Complete" if eval_data.get("evaluation_date") else meta.get("status", "Not Trained"),
        "evaluation_status": "Evaluation Complete" if eval_data else "Evaluation Pending",
        "trained_at":        meta.get("training_date"),
        "evaluation_date":   eval_data.get("evaluation_date"),
        "accuracy":          eval_data.get("accuracy"),
        "precision":         eval_data.get("precision"),
        "recall":            eval_data.get("recall"),
        "f1":                eval_data.get("f1_score"),
        "macro_f1":          eval_data.get("macro_f1"),
        "weighted_f1":       eval_data.get("weighted_f1"),
    }


@router.get("/{id}")
async def get_model(id: str):
    result = await get_models()
    for m in result["models"]:
        if m["id"] == id:
            return m
    return {"message": "Model not found"}


@router.post("/{id}/activate")
async def activate_model(id: str):
    meta   = load_metadata()
    status = meta.get("status", "Not Trained")
    if status in ("Trained", "Evaluation Complete"):
        return {
            "success": True,
            "message": "BERT Fake News Classifier is active and ready to serve predictions."
        }
    return {
        "success": False,
        "message": "Model cannot be activated. Run Phase 9B training first."
    }
