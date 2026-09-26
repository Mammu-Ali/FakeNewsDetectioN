"""
config.py
---------
Central training configuration for TruthGuard BERT Fake News Classifier.
Change values here to adjust training without touching other files.
"""

import os

# ─── Paths ───────────────────────────────────────────────────────────────────
# Project root = three levels up from this file (backend/app/ml/config.py)
PROJECT_ROOT = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "..")
)

# Processed dataset paths (Phase 9A output lives in backend/app/ml/data/)
# The spec also mentions dataset/processed/ — we support both and auto-detect.
DATASET_SEARCH_PATHS = [
    os.path.join(PROJECT_ROOT, "dataset", "processed"),
    os.path.join(os.path.dirname(__file__), "data"),
]

# Where to save the trained model
MODEL_SAVE_DIR = os.path.join(PROJECT_ROOT, "models", "bert_fake_news")

# Training artefacts
CHECKPOINT_DIR  = os.path.join(PROJECT_ROOT, "training", "checkpoints")
TRAINING_LOG    = os.path.join(PROJECT_ROOT, "training", "logs", "training_history.json")
METADATA_FILE   = os.path.join(MODEL_SAVE_DIR, "model_metadata.json")

# ─── Model ───────────────────────────────────────────────────────────────────
PRETRAINED_MODEL_NAME = "bert-base-uncased"
NUM_LABELS            = 2

# Label mapping  (Phase 9A: 0=Fake, 1=True  →  we remap to  0=REAL, 1=FAKE)
# raw_label → bert_label
LABEL_REMAP = {0: 1, 1: 0}   # 0(Fake)->1(FAKE), 1(True)->0(REAL)
LABEL_MAP   = {0: "REAL", 1: "FAKE"}   # bert label → human name

# ─── Tokenisation ────────────────────────────────────────────────────────────
MAX_LENGTH = 256
PADDING    = "max_length"
TRUNCATION = True

# ─── Training ────────────────────────────────────────────────────────────────
EPOCHS         = 3
BATCH_SIZE     = 8
LEARNING_RATE  = 2e-5
WEIGHT_DECAY   = 0.01
VALIDATION_SPLIT = 0.1    # fraction carved from train when no val file exists
RANDOM_SEED    = 42

# ─── Column names in processed CSVs ──────────────────────────────────────────
# Candidates tried in order; first found wins
TEXT_COLUMN_CANDIDATES  = ["content", "text", "article", "news"]
LABEL_COLUMN_CANDIDATES = ["label", "labels", "class", "target"]
