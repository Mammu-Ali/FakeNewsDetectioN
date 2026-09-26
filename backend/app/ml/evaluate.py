"""
evaluate.py
-----------
PHASE 9C — BERT Model Evaluation for TruthGuard Fake News Classifier.

Run from the project root:
    python -m backend.app.ml.evaluate
or:
    python backend/app/ml/evaluate.py

IMPORTANT:
- Uses the ACTUAL trained BERT model from models/bert_fake_news/
- Uses the ACTUAL untouched test dataset from dataset/processed/test.csv
- Does NOT retrain the model
- Does NOT fabricate metrics
- If model is missing, prints a clear error and stops.
"""

import os
import sys
import json
import time
from datetime import datetime

# ── Validate required packages ─────────────────────────────────────────────────
REQUIRED = ["torch", "transformers", "pandas", "sklearn", "numpy", "matplotlib", "seaborn"]
missing_pkgs = []
for pkg in REQUIRED:
    try:
        __import__(pkg)
    except ImportError:
        missing_pkgs.append(pkg)
if missing_pkgs:
    print(f"\n[ERROR] Missing packages: {', '.join(missing_pkgs)}")
    print("Install them with:")
    print("  pip install torch transformers tokenizers pandas scikit-learn numpy matplotlib seaborn")
    sys.exit(1)

import torch
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend — safe on all systems
import matplotlib.pyplot as plt
import seaborn as sns
from torch.utils.data import Dataset, DataLoader
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report,
    precision_recall_fscore_support,
)

# ── Resolve project root ───────────────────────────────────────────────────────
# This file lives at: <project_root>/backend/app/ml/evaluate.py
_THIS_DIR    = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(_THIS_DIR, "..", "..", ".."))


MODEL_DIR      = os.path.join(PROJECT_ROOT, "models", "bert_fake_news")
TEST_CSV_PATHS = [
    os.path.join(PROJECT_ROOT, "dataset", "processed", "test.csv"),
    os.path.join(_THIS_DIR, "data", "test.csv"),
]
EVAL_DIR       = os.path.join(PROJECT_ROOT, "training", "evaluation")
METADATA_PATH  = os.path.join(MODEL_DIR, "model_metadata.json")
LABEL_MAP_PATH = os.path.join(MODEL_DIR, "label_mapping.json")

# Evaluation hyperparameters
BATCH_SIZE = 32
MAX_LENGTH = 256

# Label convention (matches Phase 9A raw labels → BERT label remap)
# Phase 9A raw: 0 = Fake, 1 = Real
# Phase 9B BERT remap: {0: 1, 1: 0}  →  BERT 0 = REAL, BERT 1 = FAKE
RAW_LABEL_REMAP = {0: 1, 1: 0}
BERT_LABEL_MAP  = {0: "REAL", 1: "FAKE"}


# ─────────────────────────────────────────────────────────────────────────────
# PyTorch Dataset
# ─────────────────────────────────────────────────────────────────────────────

class EvalDataset(Dataset):
    def __init__(self, texts: list, labels: list, tokenizer, max_length: int):
        self.texts     = [str(t) for t in texts]
        self.labels    = labels
        self.tokenizer = tokenizer
        self.max_len   = max_length

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        enc = self.tokenizer(
            self.texts[idx],
            padding="max_length",
            truncation=True,
            max_length=self.max_len,
            return_tensors="pt",
        )
        return {
            "input_ids":      enc["input_ids"].squeeze(0),
            "attention_mask": enc["attention_mask"].squeeze(0),
            "label":          torch.tensor(self.labels[idx], dtype=torch.long),
        }


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def check_model_exists() -> bool:
    """Return True if the trained BERT model files are present."""
    # Hugging Face saves at least config.json in the model directory
    return os.path.isfile(os.path.join(MODEL_DIR, "config.json"))


def find_test_csv() -> str | None:
    for path in TEST_CSV_PATHS:
        if os.path.isfile(path):
            return path
    return None


def load_test_data(csv_path: str):
    """Load test.csv and return (texts, bert_labels)."""
    print(f"  Loading: {csv_path}")
    df = pd.read_csv(csv_path)
    if df.empty:
        raise ValueError("Test CSV is empty.")

    # Detect text column
    text_col = next(
        (c for c in ["content", "text", "article", "news"] if c in df.columns), None
    )
    label_col = next(
        (c for c in ["label", "labels", "class", "target"] if c in df.columns), None
    )

    if text_col is None or label_col is None:
        raise ValueError(
            f"Cannot find required columns. Available: {list(df.columns)}"
        )

    # Drop rows with empty text
    before = len(df)
    df = df.dropna(subset=[text_col])
    df = df[df[text_col].str.strip() != ""]
    dropped = before - len(df)
    if dropped:
        print(f"  Dropped {dropped} rows with empty text.")

    texts      = df[text_col].tolist()
    raw_labels = [int(l) for l in df[label_col].tolist()]
    bert_labels = [RAW_LABEL_REMAP[l] for l in raw_labels]

    raw_counts  = {v: raw_labels.count(v) for v in sorted(set(raw_labels))}
    bert_counts = {
        BERT_LABEL_MAP.get(v, v): bert_labels.count(v)
        for v in sorted(set(bert_labels))
    }
    print(f"  Raw label distribution  (0=Fake, 1=Real): {raw_counts}")
    print(f"  BERT label distribution (0=REAL, 1=FAKE): {bert_counts}")
    return texts, bert_labels


def save_confusion_matrix_image(cm_array, output_path: str):
    """Generate and save confusion matrix heatmap."""
    plt.figure(figsize=(7, 6))
    sns.heatmap(
        cm_array,
        annot=True,
        fmt="d",
        cmap="Blues",
        xticklabels=["REAL (0)", "FAKE (1)"],
        yticklabels=["REAL (0)", "FAKE (1)"],
        linewidths=0.5,
        linecolor="grey",
    )
    plt.ylabel("Actual", fontsize=13)
    plt.xlabel("Predicted", fontsize=13)
    plt.title("BERT Fake News Classifier — Confusion Matrix", fontsize=14, pad=12)
    plt.tight_layout()
    plt.savefig(output_path, dpi=150)
    plt.close()
    print(f"  Confusion matrix image saved → {output_path}")


# ─────────────────────────────────────────────────────────────────────────────
# Main evaluation entry point
# ─────────────────────────────────────────────────────────────────────────────

def main():
    print("\n" + "=" * 60)
    print("  TruthGuard — PHASE 9C: BERT Model Evaluation")
    print("=" * 60)
    eval_start = time.time()

    # ── 1. Check model exists ─────────────────────────────────────────────────
    print("\n[1/8] Verifying trained BERT model...")
    if not check_model_exists():
        print("\n" + "!" * 60)
        print("  [ERROR] Trained BERT model NOT FOUND.")
        print(f"  Expected model directory: {MODEL_DIR}")
        print("  Required files: config.json, model.safetensors")
        print("\n  STOPPING Phase 9C.")
        print("  To fix this, run Phase 9B training first:")
        print("    python -m backend.app.ml.train")
        print("!" * 60)
        sys.exit(1)
    print(f"  ✓ Model directory found: {MODEL_DIR}")

    # ── 2. Load test dataset ──────────────────────────────────────────────────
    print("\n[2/8] Loading test dataset (untouched, read-only)...")
    test_csv = find_test_csv()
    if test_csv is None:
        print("\n[ERROR] Test CSV not found. Tried:")
        for p in TEST_CSV_PATHS:
            print(f"  {p}")
        sys.exit(1)

    texts, bert_labels = load_test_data(test_csv)
    n_test = len(texts)
    print(f"  Total test samples: {n_test:,}")

    # ── 3. Load tokenizer and model ───────────────────────────────────────────
    print(f"\n[3/8] Loading tokenizer and model from {MODEL_DIR} ...")
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"  Device: {device}")

    try:
        tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)
        model     = AutoModelForSequenceClassification.from_pretrained(MODEL_DIR)
        model     = model.to(device)
        model.eval()
    except Exception as e:
        print(f"\n[ERROR] Failed to load model/tokenizer: {e}")
        sys.exit(1)

    # Show label mapping
    if os.path.isfile(LABEL_MAP_PATH):
        with open(LABEL_MAP_PATH) as f:
            saved_map = json.load(f)
        print(f"  Label mapping (from model): {saved_map.get('id2label', BERT_LABEL_MAP)}")
    else:
        print(f"  Using default label mapping: {BERT_LABEL_MAP}")

    # ── 4. Build DataLoader ───────────────────────────────────────────────────
    print(f"\n[4/8] Building DataLoader (batch_size={BATCH_SIZE}, max_length={MAX_LENGTH})...")
    eval_ds    = EvalDataset(texts, bert_labels, tokenizer, MAX_LENGTH)
    dataloader = DataLoader(eval_ds, batch_size=BATCH_SIZE, shuffle=False)
    print(f"  Total batches: {len(dataloader)}")

    # ── 5. Run predictions ────────────────────────────────────────────────────
    print(f"\n[5/8] Running predictions on {n_test:,} samples...")
    all_preds  = []
    all_labels = []

    with torch.no_grad():
        for i, batch in enumerate(dataloader):
            input_ids      = batch["input_ids"].to(device)
            attention_mask = batch["attention_mask"].to(device)
            labels_batch   = batch["label"].to(device)

            outputs = model(input_ids=input_ids, attention_mask=attention_mask)
            probs   = torch.softmax(outputs.logits, dim=1)
            preds   = torch.argmax(probs, dim=1)

            all_preds.extend(preds.cpu().numpy().tolist())
            all_labels.extend(labels_batch.cpu().numpy().tolist())

            if (i + 1) % 20 == 0 or (i + 1) == len(dataloader):
                print(f"  Batch {i + 1:>4}/{len(dataloader)}  done")

    # ── 6. Calculate metrics ──────────────────────────────────────────────────
    print("\n[6/8] Calculating evaluation metrics...")

    acc      = accuracy_score(all_labels, all_preds)
    prec_bin = precision_score(all_labels, all_preds, pos_label=1, zero_division=0)
    rec_bin  = recall_score(all_labels, all_preds, pos_label=1, zero_division=0)
    f1_bin   = f1_score(all_labels, all_preds, pos_label=1, zero_division=0)

    prec_mac, rec_mac, f1_mac, _ = precision_recall_fscore_support(
        all_labels, all_preds, average="macro", zero_division=0
    )
    prec_wt, rec_wt, f1_wt, _ = precision_recall_fscore_support(
        all_labels, all_preds, average="weighted", zero_division=0
    )

    cm_array = confusion_matrix(all_labels, all_preds, labels=[0, 1])
    tn, fp, fn, tp = cm_array.ravel()

    class_report = classification_report(
        all_labels,
        all_preds,
        labels=[0, 1],
        target_names=["REAL", "FAKE"],
        output_dict=True,
        zero_division=0,
    )

    print(f"\n  Accuracy          : {acc:.4f}  ({acc * 100:.2f}%)")
    print(f"  Precision (FAKE)  : {prec_bin:.4f}  ({prec_bin * 100:.2f}%)")
    print(f"  Recall (FAKE)     : {rec_bin:.4f}  ({rec_bin * 100:.2f}%)")
    print(f"  F1 Score (FAKE)   : {f1_bin:.4f}  ({f1_bin * 100:.2f}%)")
    print(f"  Macro Precision   : {prec_mac:.4f}")
    print(f"  Macro Recall      : {rec_mac:.4f}")
    print(f"  Macro F1          : {f1_mac:.4f}")
    print(f"  Weighted Precision: {prec_wt:.4f}")
    print(f"  Weighted Recall   : {rec_wt:.4f}")
    print(f"  Weighted F1       : {f1_wt:.4f}")
    print(f"\n  Confusion Matrix (BERT labels: 0=REAL, 1=FAKE):")
    print(f"                  Predicted")
    print(f"               REAL    FAKE")
    print(f"  Actual REAL  [{tn:>5}]  [{fp:>5}]")
    print(f"  Actual FAKE  [{fn:>5}]  [{tp:>5}]")
    print(f"  TN={tn}, FP={fp}, FN={fn}, TP={tp}")

    # ── 7. Save evaluation results ────────────────────────────────────────────
    print(f"\n[7/8] Saving evaluation results to {EVAL_DIR} ...")
    os.makedirs(EVAL_DIR, exist_ok=True)
    eval_date = datetime.now().isoformat()

    eval_results = {
        "accuracy":            float(acc),
        "precision":           float(prec_bin),
        "recall":              float(rec_bin),
        "f1_score":            float(f1_bin),
        "macro_precision":     float(prec_mac),
        "macro_recall":        float(rec_mac),
        "macro_f1":            float(f1_mac),
        "weighted_precision":  float(prec_wt),
        "weighted_recall":     float(rec_wt),
        "weighted_f1":         float(f1_wt),
    }
    with open(os.path.join(EVAL_DIR, "evaluation_results.json"), "w") as f:
        json.dump(eval_results, f, indent=4)
    print("  ✓ evaluation_results.json")

    with open(os.path.join(EVAL_DIR, "classification_report.json"), "w") as f:
        json.dump(class_report, f, indent=4)
    print("  ✓ classification_report.json")

    cm_dict = {
        "true_negative":  int(tn),
        "false_positive": int(fp),
        "false_negative": int(fn),
        "true_positive":  int(tp),
    }
    with open(os.path.join(EVAL_DIR, "confusion_matrix.json"), "w") as f:
        json.dump(cm_dict, f, indent=4)
    print("  ✓ confusion_matrix.json")

    eval_summary = {
        "model_name":        "BERT Fake News Classifier",
        "model_version":     "1.0.0",
        "test_dataset_size": n_test,
        "accuracy":          float(acc),
        "precision":         float(prec_bin),
        "recall":            float(rec_bin),
        "f1_score":          float(f1_bin),
        "macro_f1":          float(f1_mac),
        "weighted_f1":       float(f1_wt),
        "confusion_matrix":  cm_dict,
        "evaluation_date":   eval_date,
        "device_used":       str(device),
    }
    with open(os.path.join(EVAL_DIR, "evaluation_summary.json"), "w") as f:
        json.dump(eval_summary, f, indent=4)
    print("  ✓ evaluation_summary.json")

    # ── 8. Confusion matrix image ─────────────────────────────────────────────
    print("\n[8/8] Generating confusion matrix visualization...")
    save_confusion_matrix_image(cm_array, os.path.join(EVAL_DIR, "confusion_matrix.png"))

    # ── Update model metadata status ──────────────────────────────────────────
    if os.path.isfile(METADATA_PATH):
        try:
            with open(METADATA_PATH) as f:
                meta = json.load(f)
            meta["status"]             = "Evaluation Complete"
            meta["evaluation_status"]  = "Evaluation Complete"
            meta["evaluation_date"]    = eval_date
            meta["accuracy"]           = float(acc)
            meta["f1_score"]           = float(f1_bin)
            with open(METADATA_PATH, "w") as f:
                json.dump(meta, f, indent=2)
            print("  ✓ model_metadata.json status → Evaluation Complete")
        except Exception as e:
            print(f"  Warning: Could not update model metadata: {e}")

    # ── Final summary ─────────────────────────────────────────────────────────
    total_time = time.time() - eval_start
    print("\n" + "=" * 60)
    print("  PHASE 9C COMPLETE")
    print("=" * 60)
    print(f"\nModel:\n  BERT Fake News Classifier")
    print(f"\nTest Samples:\n  {n_test:,}")
    print(f"\nAccuracy:\n  {acc:.4f}  ({acc * 100:.2f}%)")
    print(f"\nPrecision:\n  {prec_bin:.4f}  ({prec_bin * 100:.2f}%)")
    print(f"\nRecall:\n  {rec_bin:.4f}  ({rec_bin * 100:.2f}%)")
    print(f"\nF1 Score:\n  {f1_bin:.4f}  ({f1_bin * 100:.2f}%)")
    print(f"\nConfusion Matrix:\n  [[{tn}, {fp}],\n   [{fn}, {tp}]]")
    print(f"  (TN={tn}, FP={fp}, FN={fn}, TP={tp})")
    print(f"\nEvaluation:\n  Complete")
    print(f"\nModel Location:\n  {MODEL_DIR}")
    print(f"\nEvaluation Results:\n  {EVAL_DIR}")
    print(f"\nTotal evaluation time: {total_time:.1f}s")
    print("=" * 60)


if __name__ == "__main__":
    main()
