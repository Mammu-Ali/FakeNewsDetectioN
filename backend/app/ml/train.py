"""
train.py
--------
PHASE 9B — BERT Fine-Tuning for TruthGuard Fake News Classifier.

Run with:
    python -m backend.app.ml.train
or from the project root:
    python backend/app/ml/train.py
"""

import os
import sys
import json
import time
from datetime import datetime

# ── Validate required packages before anything else ──────────────────────────
REQUIRED = ["torch", "transformers", "pandas", "sklearn"]
missing = []
for pkg in REQUIRED:
    try:
        __import__(pkg)
    except ImportError:
        missing.append(pkg)
if missing:
    print(f"\n[ERROR] Missing packages: {', '.join(missing)}")
    print("Install them with:")
    print("  pip install torch transformers tokenizers pandas scikit-learn")
    sys.exit(1)

import torch
import pandas as pd
from torch.utils.data import Dataset, DataLoader
from torch.optim import AdamW
from transformers import get_linear_schedule_with_warmup
from sklearn.model_selection import train_test_split

from backend.app.ml.config import (
    EPOCHS, BATCH_SIZE, LEARNING_RATE, WEIGHT_DECAY,
    VALIDATION_SPLIT, RANDOM_SEED,
    MAX_LENGTH, PADDING, TRUNCATION,
    MODEL_SAVE_DIR, CHECKPOINT_DIR, TRAINING_LOG, METADATA_FILE,
    PRETRAINED_MODEL_NAME, LABEL_MAP, LABEL_REMAP,
)
from backend.app.ml.utils import (
    find_dataset_dir, load_and_validate_split,
    save_model_metadata, save_training_log,
)
from backend.app.ml.model import get_model
from backend.app.ml.tokenizer import get_tokenizer


# ─────────────────────────────────────────────────────────────────────────────
# PyTorch Dataset
# ─────────────────────────────────────────────────────────────────────────────

class FakeNewsDataset(Dataset):
    def __init__(self, texts: list[str], labels: list[int], tokenizer, max_len: int):
        self.texts     = texts
        self.labels    = labels
        self.tokenizer = tokenizer
        self.max_len   = max_len

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        encoding = self.tokenizer(
            self.texts[idx],
            padding=PADDING,
            truncation=TRUNCATION,
            max_length=self.max_len,
            return_tensors="pt",
        )
        return {
            "input_ids":      encoding["input_ids"].squeeze(0),
            "attention_mask": encoding["attention_mask"].squeeze(0),
            "labels":         torch.tensor(self.labels[idx], dtype=torch.long),
        }


# ─────────────────────────────────────────────────────────────────────────────
# Training / Evaluation helpers
# ─────────────────────────────────────────────────────────────────────────────

def train_epoch(model, loader, optimizer, scheduler, device):
    model.train()
    total_loss = 0.0
    for batch in loader:
        optimizer.zero_grad()
        input_ids      = batch["input_ids"].to(device)
        attention_mask = batch["attention_mask"].to(device)
        labels         = batch["labels"].to(device)
        outputs = model(input_ids=input_ids, attention_mask=attention_mask, labels=labels)
        loss = outputs.loss
        total_loss += loss.item()
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        optimizer.step()
        scheduler.step()
    return total_loss / len(loader)


def eval_epoch(model, loader, device):
    model.eval()
    total_loss = 0.0
    correct    = 0
    total      = 0
    with torch.no_grad():
        for batch in loader:
            input_ids      = batch["input_ids"].to(device)
            attention_mask = batch["attention_mask"].to(device)
            labels         = batch["labels"].to(device)
            outputs = model(input_ids=input_ids, attention_mask=attention_mask, labels=labels)
            total_loss += outputs.loss.item()
            preds = torch.argmax(outputs.logits, dim=1)
            correct += (preds == labels).sum().item()
            total   += labels.size(0)
    return total_loss / len(loader), correct / total


# ─────────────────────────────────────────────────────────────────────────────
# Main training entry point
# ─────────────────────────────────────────────────────────────────────────────

def main():
    print("\n" + "=" * 60)
    print("  TruthGuard — PHASE 9B: BERT Fine-Tuning")
    print("=" * 60)
    start_time = time.time()

    # ── Device ───────────────────────────────────────────────────────────────
    cuda_available = torch.cuda.is_available()
    device = torch.device("cuda" if cuda_available else "cpu")
    print(f"\nDevice        : {device}")
    print(f"CUDA available: {cuda_available}")
    if cuda_available:
        print(f"GPU name      : {torch.cuda.get_device_name(0)}")

    # ── Locate & load processed dataset ──────────────────────────────────────
    print("\n[1/6] Locating processed dataset...")
    try:
        dataset_dir = find_dataset_dir()
    except FileNotFoundError as e:
        print(f"\n[ERROR] {e}")
        sys.exit(1)
    print(f"  Dataset directory: {dataset_dir}")

    train_path = os.path.join(dataset_dir, "train.csv")
    val_path   = os.path.join(dataset_dir, "validation.csv")
    test_path  = os.path.join(dataset_dir, "test.csv")

    print("\n[2/6] Loading and validating splits...")
    try:
        train_df = load_and_validate_split(train_path, "train")

        # If validation.csv doesn't exist, carve it from train
        if os.path.isfile(val_path):
            val_df = load_and_validate_split(val_path, "validation")
        else:
            print(f"  validation.csv not found — splitting {VALIDATION_SPLIT:.0%} from train.")
            train_df, val_df = train_test_split(
                train_df, test_size=VALIDATION_SPLIT,
                random_state=RANDOM_SEED, stratify=train_df["label"]
            )
            train_df = train_df.reset_index(drop=True)
            val_df   = val_df.reset_index(drop=True)
            print(f"  After split — train: {len(train_df):,} | val: {len(val_df):,}")

        test_df = load_and_validate_split(test_path, "test")
    except (FileNotFoundError, ValueError) as e:
        print(f"\n[ERROR] {e}")
        sys.exit(1)

    n_train = len(train_df)
    n_val   = len(val_df)
    n_test  = len(test_df)

    print(f"\n  +-------------------------------------+")
    print(f"  | Training samples   : {n_train:>10,}    |")
    print(f"  | Validation samples : {n_val:>10,}    |")
    print(f"  | Test samples       : {n_test:>10,}    |")
    print(f"  +-------------------------------------+")

    # ── Tokenizer & Model ─────────────────────────────────────────────────────
    print("\n[3/6] Loading tokenizer and model...")
    try:
        tokenizer = get_tokenizer()
        model     = get_model()
    except Exception as e:
        print(f"\n[ERROR] Failed to load model/tokenizer: {e}")
        sys.exit(1)
    model = model.to(device)

    # ── DataLoaders ───────────────────────────────────────────────────────────
    print("\n[4/6] Building DataLoaders...")
    train_ds = FakeNewsDataset(
        train_df["text"].tolist(), train_df["label"].tolist(), tokenizer, MAX_LENGTH
    )
    val_ds = FakeNewsDataset(
        val_df["text"].tolist(), val_df["label"].tolist(), tokenizer, MAX_LENGTH
    )

    train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True)
    val_loader   = DataLoader(val_ds,   batch_size=BATCH_SIZE, shuffle=False)
    print(f"  Train batches: {len(train_loader)} | Val batches: {len(val_loader)}")

    # ── Optimizer & Scheduler ─────────────────────────────────────────────────
    optimizer = AdamW(model.parameters(), lr=LEARNING_RATE, weight_decay=WEIGHT_DECAY)
    total_steps = len(train_loader) * EPOCHS
    warmup_steps = total_steps // 10
    scheduler = get_linear_schedule_with_warmup(
        optimizer, num_warmup_steps=warmup_steps, num_training_steps=total_steps
    )

    # ── Training loop ─────────────────────────────────────────────────────────
    print(f"\n[5/6] Training for {EPOCHS} epoch(s)  (batch={BATCH_SIZE}, lr={LEARNING_RATE})...\n")
    os.makedirs(CHECKPOINT_DIR, exist_ok=True)
    os.makedirs(MODEL_SAVE_DIR, exist_ok=True)

    history     = []
    best_val_acc = 0.0

    for epoch in range(1, EPOCHS + 1):
        ep_start = time.time()
        print(f"  -- Epoch {epoch}/{EPOCHS} --")

        try:
            train_loss              = train_epoch(model, train_loader, optimizer, scheduler, device)
            val_loss, val_acc       = eval_epoch(model, val_loader, device)
        except KeyboardInterrupt:
            print("\n[INTERRUPTED] Training was stopped by user.")
            sys.exit(0)
        except Exception as e:
            print(f"\n[ERROR] Training failed at epoch {epoch}: {e}")
            raise

        ep_secs = time.time() - ep_start
        print(f"    train_loss={train_loss:.4f}  val_loss={val_loss:.4f}  val_acc={val_acc:.4f}  ({ep_secs:.0f}s)")

        history.append({
            "epoch":              epoch,
            "training_loss":      round(train_loss, 6),
            "validation_loss":    round(val_loss, 6),
            "validation_accuracy": round(val_acc, 6),
        })

        # Save best checkpoint
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            ckpt_path = os.path.join(CHECKPOINT_DIR, f"best_checkpoint_epoch{epoch}")
            model.save_pretrained(ckpt_path)
            tokenizer.save_pretrained(ckpt_path)
            print(f"    ✓ Best checkpoint saved → {ckpt_path}")

    # ── Save final model ──────────────────────────────────────────────────────
    print(f"\n[6/6] Saving final model to {MODEL_SAVE_DIR} ...")
    model.save_pretrained(MODEL_SAVE_DIR)
    tokenizer.save_pretrained(MODEL_SAVE_DIR)

    label_mapping_file = os.path.join(MODEL_SAVE_DIR, "label_mapping.json")
    with open(label_mapping_file, "w") as f:
        json.dump({"id2label": LABEL_MAP, "label2id": {v: k for k, v in LABEL_MAP.items()}}, f, indent=2)

    # ── Metadata ──────────────────────────────────────────────────────────────
    training_duration = round(time.time() - start_time, 1)
    metadata = {
        "model_name":            "BERT Fake News Classifier",
        "base_model":            PRETRAINED_MODEL_NAME,
        "version":               "1.0.0",
        "status":                "Trained",
        "training_date":         datetime.utcnow().isoformat() + "Z",
        "epochs":                EPOCHS,
        "batch_size":            BATCH_SIZE,
        "learning_rate":         LEARNING_RATE,
        "weight_decay":          WEIGHT_DECAY,
        "max_sequence_length":   MAX_LENGTH,
        "training_samples":      n_train,
        "validation_samples":    n_val,
        "test_samples":          n_test,
        "label_mapping":         LABEL_MAP,
        "device":                str(device),
        "cuda_available":        cuda_available,
        "training_duration_sec": training_duration,
        "model_save_path":       MODEL_SAVE_DIR,
        "evaluation_status":     "Evaluation Pending",
    }
    save_model_metadata(metadata)

    # ── Training log ─────────────────────────────────────────────────────────
    save_training_log(history, TRAINING_LOG)

    # ── Summary ───────────────────────────────────────────────────────────────
    print("\n" + "=" * 60)
    print("  PHASE 9B COMPLETE")
    print("=" * 60)
    print(f"  Dataset used       : {dataset_dir}")
    print(f"  Training samples   : {n_train:,}")
    print(f"  Validation samples : {n_val:,}")
    print(f"  Test samples       : {n_test:,}")
    print(f"  BERT model         : {PRETRAINED_MODEL_NAME}")
    print(f"  Epochs             : {EPOCHS}")
    print(f"  Batch size         : {BATCH_SIZE}")
    print(f"  Device             : {device}")
    print(f"  Training status    : ✓ Completed successfully")
    print(f"  Model saved to     : {MODEL_SAVE_DIR}")
    print(f"  Training log       : {TRAINING_LOG}")
    print(f"  Total time         : {training_duration:.0f}s")
    print("=" * 60)


if __name__ == "__main__":
    main()
