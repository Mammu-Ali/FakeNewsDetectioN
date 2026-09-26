"""
utils.py
--------
Helper utilities: dataset discovery, validation, and status management.
"""

import os
import json
import sys
import pandas as pd
from datetime import datetime

from backend.app.ml.config import (
    DATASET_SEARCH_PATHS,
    TEXT_COLUMN_CANDIDATES,
    LABEL_COLUMN_CANDIDATES,
    LABEL_REMAP,
    LABEL_MAP,
    METADATA_FILE,
)


# ─── Dataset Discovery ───────────────────────────────────────────────────────

def find_dataset_dir() -> str:
    """Return the first search path that contains train.csv."""
    for path in DATASET_SEARCH_PATHS:
        if os.path.isfile(os.path.join(path, "train.csv")):
            return path
    raise FileNotFoundError(
        "Could not find train.csv in any of these locations:\n"
        + "\n".join(f"  {p}" for p in DATASET_SEARCH_PATHS)
        + "\nRun the Phase 9A preprocessing script first."
    )


def detect_columns(df: pd.DataFrame) -> tuple[str, str]:
    """Auto-detect the text and label columns from a DataFrame."""
    text_col = next(
        (c for c in TEXT_COLUMN_CANDIDATES if c in df.columns), None
    )
    label_col = next(
        (c for c in LABEL_COLUMN_CANDIDATES if c in df.columns), None
    )

    if text_col is None:
        raise ValueError(
            f"No text column found. Tried: {TEXT_COLUMN_CANDIDATES}. "
            f"Available: {list(df.columns)}"
        )
    if label_col is None:
        raise ValueError(
            f"No label column found. Tried: {LABEL_COLUMN_CANDIDATES}. "
            f"Available: {list(df.columns)}"
        )
    return text_col, label_col


# ─── Dataset Loading & Validation ────────────────────────────────────────────

def load_and_validate_split(path: str, split_name: str) -> pd.DataFrame:
    """Load a CSV split, validate it, and remap labels to BERT convention."""
    if not os.path.isfile(path):
        raise FileNotFoundError(f"[{split_name}] File not found: {path}")

    print(f"  Loading {split_name}: {path}")
    try:
        df = pd.read_csv(path)
    except Exception as e:
        raise ValueError(f"[{split_name}] Could not read CSV: {e}")

    if df.empty:
        raise ValueError(f"[{split_name}] CSV is empty.")

    text_col, label_col = detect_columns(df)
    print(f"  Detected columns -> text: '{text_col}', label: '{label_col}'")

    # Drop rows with empty text
    before = len(df)
    df = df.dropna(subset=[text_col])
    df = df[df[text_col].str.strip() != ""]
    dropped = before - len(df)
    if dropped:
        print(f"  Dropped {dropped} rows with empty text in {split_name}.")

    # Validate labels
    raw_labels = set(df[label_col].unique())
    valid_raw  = {0, 1}
    invalid    = raw_labels - valid_raw
    if invalid:
        raise ValueError(
            f"[{split_name}] Invalid label values found: {invalid}. "
            f"Expected only {valid_raw}."
        )

    # Remap: Phase 9A used 0=Fake, 1=True → BERT needs 0=REAL, 1=FAKE
    df["bert_label"] = df[label_col].map(LABEL_REMAP)

    df = df[[text_col, "bert_label"]].rename(columns={text_col: "text", "bert_label": "label"})
    df = df.reset_index(drop=True)

    counts = df["label"].value_counts().sort_index().to_dict()
    label_str = " | ".join(
        f"{LABEL_MAP.get(k, k)}: {v}" for k, v in counts.items()
    )
    print(f"  {split_name} size: {len(df):,}  ({label_str})")
    return df


# ─── Model Status File ───────────────────────────────────────────────────────

def save_model_metadata(metadata: dict):
    os.makedirs(os.path.dirname(METADATA_FILE), exist_ok=True)
    with open(METADATA_FILE, "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"  Metadata saved → {METADATA_FILE}")


def load_model_metadata() -> dict:
    if not os.path.isfile(METADATA_FILE):
        return {"status": "Not Trained"}
    with open(METADATA_FILE) as f:
        return json.load(f)


# ─── Training Log ────────────────────────────────────────────────────────────

def save_training_log(history: list[dict], log_path: str):
    os.makedirs(os.path.dirname(log_path), exist_ok=True)
    with open(log_path, "w") as f:
        json.dump(history, f, indent=2)
    print(f"  Training log saved → {log_path}")
