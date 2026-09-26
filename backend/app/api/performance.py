import os
import json
from fastapi import APIRouter

router = APIRouter()

# Resolve project root (this file is at backend/app/api/performance.py)
_THIS_DIR    = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(_THIS_DIR, "..", "..", ".."))

EVAL_SUMMARY_PATH       = os.path.join(PROJECT_ROOT, "training", "evaluation", "evaluation_summary.json")
EVAL_RESULTS_PATH       = os.path.join(PROJECT_ROOT, "training", "evaluation", "evaluation_results.json")
CONFUSION_MATRIX_PATH   = os.path.join(PROJECT_ROOT, "training", "evaluation", "confusion_matrix.json")
CLASSIFICATION_RPT_PATH = os.path.join(PROJECT_ROOT, "training", "evaluation", "classification_report.json")
TRAINING_LOG_PATH       = os.path.join(PROJECT_ROOT, "training", "logs", "training_history.json")
MODEL_METADATA_PATH     = os.path.join(PROJECT_ROOT, "models", "bert_fake_news", "model_metadata.json")


def _load_json(path: str, default=None):
    if os.path.isfile(path):
        with open(path, "r") as f:
            return json.load(f)
    return default if default is not None else {}


@router.get("")
async def get_performance():
    """Return actual evaluation results from Phase 9C. Never hard-codes metrics."""
    summary = _load_json(EVAL_SUMMARY_PATH)
    results = _load_json(EVAL_RESULTS_PATH)
    cm      = _load_json(CONFUSION_MATRIX_PATH)
    report  = _load_json(CLASSIFICATION_RPT_PATH)
    meta    = _load_json(MODEL_METADATA_PATH)
    history = _load_json(TRAINING_LOG_PATH, default=[])

    if summary:
        cm_data = summary.get("confusion_matrix", cm or {})
        # Normalise confusion matrix keys (old files used tn/fp, new ones use true_negative etc.)
        cm_normalised = {
            "tn": cm_data.get("true_negative", cm_data.get("tn", 0)),
            "fp": cm_data.get("false_positive", cm_data.get("fp", 0)),
            "fn": cm_data.get("false_negative", cm_data.get("fn", 0)),
            "tp": cm_data.get("true_positive",  cm_data.get("tp", 0)),
        }
        return {
            "model": {
                "name":              summary.get("model_name", "BERT Fake News Classifier"),
                "version":           summary.get("model_version", "1.0.0"),
                "base_model":        meta.get("base_model", "bert-base-uncased"),
                "training_date":     meta.get("training_date"),
                "evaluation_date":   summary.get("evaluation_date"),
                "training_samples":  meta.get("training_samples"),
                "validation_samples":meta.get("validation_samples"),
                "test_samples":      summary.get("test_dataset_size"),
                "epochs":            meta.get("epochs"),
                "batch_size":        meta.get("batch_size"),
                "learning_rate":     meta.get("learning_rate"),
                "device":            summary.get("device_used"),
            },
            "status": "evaluation_complete",
            "metrics": {
                "accuracy":           summary.get("accuracy"),
                "precision":          summary.get("precision"),
                "recall":             summary.get("recall"),
                "f1":                 summary.get("f1_score"),
                "macro_f1":           summary.get("macro_f1"),
                "weighted_f1":        summary.get("weighted_f1"),
                "macro_precision":    results.get("macro_precision"),
                "macro_recall":       results.get("macro_recall"),
                "weighted_precision": results.get("weighted_precision"),
                "weighted_recall":    results.get("weighted_recall"),
            },
            "targets": {
                "accuracy_target": 0.90,
                "f1_target":       0.90,
            },
            "confusion_matrix": cm_normalised,
            "classification_report": report,
            "training_history": history,
            "dataset": {
                "name":         "ISOT Fake News Dataset",
                "version":      "v1.0",
                "total_samples": meta.get("training_samples", 0) + meta.get("validation_samples", 0) + summary.get("test_dataset_size", 0),
                "test_samples":  summary.get("test_dataset_size"),
                "label_0":       "REAL",
                "label_1":       "FAKE",
            },
        }
    else:
        return {
            "model": {
                "name":    meta.get("model_name", "BERT Fake News Classifier"),
                "version": meta.get("version", "1.0.0"),
                "base_model": meta.get("base_model", "bert-base-uncased"),
                "training_date": meta.get("training_date"),
                "evaluation_date": None,
            },
            "status": "evaluation_pending",
            "metrics": {
                "accuracy": None, "precision": None, "recall": None,
                "f1": None, "macro_f1": None, "weighted_f1": None,
            },
            "targets": {"accuracy_target": 0.90, "f1_target": 0.90},
            "confusion_matrix": None,
            "classification_report": None,
            "training_history": history,
            "dataset": None,
        }


@router.get("/confusion-matrix")
async def get_confusion_matrix():
    """Return confusion matrix values."""
    cm = _load_json(CONFUSION_MATRIX_PATH)
    if not cm:
        return {"available": False}
    return {
        "available": True,
        "tn": cm.get("true_negative", 0),
        "fp": cm.get("false_positive", 0),
        "fn": cm.get("false_negative", 0),
        "tp": cm.get("true_positive", 0),
    }


@router.get("/training-history")
async def get_training_history():
    """Return per-epoch training loss / validation accuracy."""
    history = _load_json(TRAINING_LOG_PATH, default=[])
    return {"history": history, "available": len(history) > 0}


@router.get("/model-versions")
async def get_model_versions():
    """Return version history. Currently one trained version."""
    meta = _load_json(MODEL_METADATA_PATH)
    summary = _load_json(EVAL_SUMMARY_PATH)
    if not meta:
        return {"versions": []}
    version = {
        "id":      "bert-fake-news-v1",
        "version": meta.get("version", "1.0.0"),
        "name":    meta.get("model_name", "BERT Fake News Classifier"),
        "status":  meta.get("status", "Trained"),
        "training_date": meta.get("training_date"),
        "accuracy": summary.get("accuracy") if summary else None,
        "f1":       summary.get("f1_score") if summary else None,
        "base_model": meta.get("base_model", "bert-base-uncased"),
        "epochs":   meta.get("epochs"),
        "device":   meta.get("device"),
        "is_active": True,
    }
    return {"versions": [version]}
