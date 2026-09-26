import os
import sys
import types

# Workaround for PyTorch Python 3.13 issue with torch._strobelight
if 'torch._strobelight' not in sys.modules:
    m = types.ModuleType('torch._strobelight')
    sys.modules['torch._strobelight'] = m
    m_comp = types.ModuleType('torch._strobelight.compile_time_profiler')
    sys.modules['torch._strobelight.compile_time_profiler'] = m_comp
    m_comp.StrobelightCompileTimeProfiler = type('StrobelightCompileTimeProfiler', (), {})

import json
import time
import torch
import logging
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import numpy as np
from collections import Counter

logger = logging.getLogger(__name__)

# Limit CPU threads to reduce RAM overhead on constrained environments (e.g. Render Free)
# This does not affect model weights or prediction accuracy.
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
if ENVIRONMENT == "production":
    torch.set_num_threads(1)

# Model is located at project_root/models/bert_fake_news
MODEL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "models", "bert_fake_news"))

class InferenceService:
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.label_mapping = {0: "REAL", 1: "FAKE"}
        self.model_name = "BERT Fake News Classifier"
        self.model_version = "1.0.0"
        self.status = "not_trained"
        # Always use CPU — CUDA is not available on Render Free and adds zero benefit.
        # On a GPU machine, cuda will still be selected automatically via is_available().
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logger.info(f"InferenceService using device: {self.device}")
        self.load_model()
        
    def load_model(self):
        try:
            if not os.path.exists(MODEL_DIR):
                logger.error(
                    f"Trained model directory not found: {MODEL_DIR}. "
                    "The trained BERT model files must be present at this path. "
                    "Run training first or supply the model via a persistent disk/volume."
                )
                return

            config_path = os.path.join(MODEL_DIR, "config.json")
            if not os.path.exists(config_path):
                logger.error(
                    f"config.json not found in {MODEL_DIR}. "
                    "The trained BERT model artefacts are missing (config.json, model.safetensors, tokenizer files). "
                    "Do NOT fall back to bert-base-uncased in production — supply the trained model. "
                    "To fix: commit the trained model files to the repository or mount a Render Persistent Disk."
                )
                return

            model_to_load = MODEL_DIR
            self.tokenizer = AutoTokenizer.from_pretrained(model_to_load)
            self.model = AutoModelForSequenceClassification.from_pretrained(model_to_load, num_labels=2)
            self.model.to(self.device)
            self.model.eval()

            # Load metadata if exists
            metadata_path = os.path.join(MODEL_DIR, "model_metadata.json")
            if os.path.exists(metadata_path):
                with open(metadata_path, 'r') as f:
                    metadata = json.load(f)
                    if "status" in metadata:
                        self.status = metadata["status"]
            else:
                self.status = "Active"

            logger.info(f"BERT model loaded successfully from {MODEL_DIR}.")
            self.status = "Active"
        except Exception as e:
            logger.error(f"Error loading BERT model: {e}")
            self.model = None
            self.tokenizer = None

    def is_loaded(self):
        return self.model is not None and self.tokenizer is not None

    def predict(self, text: str):
        if not self.is_loaded():
            raise ValueError("Model not loaded")

        start_time = time.time()
        
        # Simple lightweight keyword extraction
        words = [w for w in text.split() if len(w) > 5]
        keywords = [word for word, count in Counter(words).most_common(3)]
        if not keywords:
            keywords = []
            
        # Tokenize
        inputs = self.tokenizer(
            text,
            return_tensors="pt",
            truncation=True,
            padding=True,
            max_length=256
        )
        
        inputs = {k: v.to(self.device) for k, v in inputs.items()}
        
        # Inference
        with torch.no_grad():
            outputs = self.model(**inputs)
            logits = outputs.logits
            probs = torch.nn.functional.softmax(logits, dim=-1).cpu().numpy()[0]
            
        pred_class_idx = int(np.argmax(probs))
        confidence = float(probs[pred_class_idx])
        prediction = self.label_mapping.get(pred_class_idx, "UNKNOWN")
        
        inference_time_ms = int((time.time() - start_time) * 1000)
        
        return {
            "prediction": prediction,
            "confidence": confidence,
            "keywords": keywords,
            "explanation": "Predicted using trained model confidence.",
            "explanation_status": "basic",
            "model_name": self.model_name,
            "model_version": self.model_version,
            "demo": False,
            "inference_time_ms": inference_time_ms
        }

# Global instance
inference_service = InferenceService()
