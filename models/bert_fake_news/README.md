# TruthGuard — BERT Fake News Classifier

This directory contains the trained BERT model artefacts saved after **Phase 9B**.

---

## Contents

| File / Folder | Description |
|---|---|
| `config.json` | Hugging Face model configuration |
| `model.safetensors` | Trained model weights |
| `tokenizer.json` | Tokenizer configuration |
| `tokenizer_config.json` | Tokenizer metadata |
| `vocab.txt` | BERT vocabulary |
| `label_mapping.json` | `{0: "REAL", 1: "FAKE"}` |
| `model_metadata.json` | Training details (date, hyperparams, sample counts) |

---

## How to Train

### 1. Install dependencies
From the project root:
```bash
pip install torch transformers tokenizers pandas scikit-learn
```
Or install from the backend requirements file:
```bash
pip install -r backend/requirements.txt
```

### 2. Verify dataset
Ensure the Phase 9A processed data exists at one of:
- `dataset/processed/train.csv` + `test.csv`
- `backend/app/ml/data/train.csv` + `test.csv`

### 3. Start training
From the **project root directory**:
```bash
python -m backend.app.ml.train
```
Or equivalently:
```bash
python backend/app/ml/train.py
```

### 4. Where the model is saved
On completion the trained model is saved to:
```
models/bert_fake_news/
```

### 5. How to know training completed
The terminal will print:
```
PHASE 9B COMPLETE
...
Training status    : ✓ Completed successfully
```
A `model_metadata.json` file with `"status": "Trained"` will be written to `models/bert_fake_news/`.
The training epoch log is saved to `training/logs/training_history.json`.

### 6. GPU / CPU behaviour
- If a CUDA-compatible GPU is detected, training runs on GPU automatically.
- If no GPU is available, training falls back to CPU gracefully (slower but functional).
- The device used is recorded in `model_metadata.json`.

---

## Model Details

| Property | Value |
|---|---|
| Base model | `bert-base-uncased` |
| Task | Binary sequence classification |
| Labels | `0 = REAL`, `1 = FAKE` |
| Max sequence length | 256 tokens |
| Framework | PyTorch + Hugging Face Transformers |

---

## Evaluation

Evaluation metrics (accuracy, F1, confusion matrix) will be generated in **Phase 9C**.
Until then, the model status on the frontend displays: **Evaluation Pending**.
