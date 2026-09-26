"""
model.py
--------
BERT model definition for TruthGuard Fake News Classification.
"""

from transformers import AutoModelForSequenceClassification
from backend.app.ml.config import PRETRAINED_MODEL_NAME, NUM_LABELS, LABEL_MAP


def get_model() -> AutoModelForSequenceClassification:
    """
    Load bert-base-uncased with a sequence-classification head.
    num_labels=2 → 0=REAL, 1=FAKE
    """
    print(f"  Loading model: {PRETRAINED_MODEL_NAME}  (num_labels={NUM_LABELS})")
    model = AutoModelForSequenceClassification.from_pretrained(
        PRETRAINED_MODEL_NAME,
        num_labels=NUM_LABELS,
        id2label=LABEL_MAP,
        label2id={v: k for k, v in LABEL_MAP.items()},
    )
    return model
