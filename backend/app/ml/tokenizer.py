"""
tokenizer.py
------------
Tokenization helpers for TruthGuard BERT pipeline.
"""

from transformers import AutoTokenizer
from backend.app.ml.config import (
    PRETRAINED_MODEL_NAME,
    MAX_LENGTH,
    PADDING,
    TRUNCATION,
)


def get_tokenizer() -> AutoTokenizer:
    """Load the pretrained tokenizer."""
    print(f"  Loading tokenizer: {PRETRAINED_MODEL_NAME}")
    return AutoTokenizer.from_pretrained(PRETRAINED_MODEL_NAME)


def tokenize_batch(tokenizer: AutoTokenizer, texts: list[str]) -> dict:
    """
    Tokenize a list of text strings.
    Returns a dict with input_ids, attention_mask, token_type_ids.
    """
    return tokenizer(
        texts,
        padding=PADDING,
        truncation=TRUNCATION,
        max_length=MAX_LENGTH,
        return_tensors="pt",
    )
