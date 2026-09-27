"""
tests/test_database.py
-----------------------
Phase 10 — Database Tests
Tests database connection, table creation, CRUD operations, and user isolation.
Run from backend/ directory with:
    python -m pytest tests/test_database.py -v
"""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.database import Base
from app.db import crud, schemas, models


# ─── Test Database Setup (in-memory SQLite) ───────────────────────────────────

TEST_DATABASE_URL = "sqlite:///:memory:"

@pytest.fixture(scope="function")
def db():
    """Provide a fresh in-memory SQLite DB for each test."""
    engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    TestSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestSession()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


# ─── 1. Database Connection ───────────────────────────────────────────────────

def test_database_connection(db):
    """Test that database connection is established."""
    result = db.execute(models.User.__table__.select()).fetchall()
    assert result == []  # Empty table, but connection works


# ─── 2. Table Creation ────────────────────────────────────────────────────────

def test_tables_created(db):
    """Test that all required tables exist."""
    from sqlalchemy import inspect
    inspector = inspect(db.get_bind())
    tables = inspector.get_table_names()
    assert "users" in tables
    assert "predictions" in tables
    assert "models" in tables
    assert "datasets" in tables
    assert "evaluations" in tables


# ─── 3. User Creation ─────────────────────────────────────────────────────────

def test_create_user(db):
    """Test user creation with hashed password."""
    user = crud.create_user(db, schemas.UserCreate(
        name="Test User",
        email="test@example.com",
        password="securepassword123"
    ))
    assert user.id is not None
    assert user.email == "test@example.com"
    assert user.name == "Test User"
    # Password must be hashed — never stored as plaintext
    assert user.password_hash != "securepassword123"
    assert user.password_hash.startswith("$2")  # bcrypt hash prefix


def test_password_verification(db):
    """Test that password verification works correctly."""
    user = crud.create_user(db, schemas.UserCreate(
        name="Test User",
        email="verify@example.com",
        password="mypassword"
    ))
    assert crud.verify_password("mypassword", user.password_hash) is True
    assert crud.verify_password("wrongpassword", user.password_hash) is False


def test_duplicate_email_raises(db):
    """Test that creating a user with a duplicate email is detectable."""
    crud.create_user(db, schemas.UserCreate(
        name="User One", email="dup@example.com", password="pass1"
    ))
    existing = crud.get_user_by_email(db, "dup@example.com")
    assert existing is not None  # Caller (auth.py) should raise 400


# ─── 4. Prediction Creation ───────────────────────────────────────────────────

def test_create_prediction(db):
    """Test prediction creation and DB persistence."""
    user = crud.create_user(db, schemas.UserCreate(
        name="Alice", email="alice@example.com", password="pass123"
    ))
    pred = crud.create_prediction(db, schemas.PredictionCreate(
        user_id=user.id,
        text="This is a test news article for testing purposes.",
        prediction="FAKE",
        confidence=0.87,
        model_name="BERT Fake News Classifier",
        model_version="1.0.0",
        inference_time_ms=145.3
    ))
    assert pred.id is not None
    assert pred.prediction == "FAKE"
    assert pred.confidence == 0.87
    assert pred.user_id == user.id


# ─── 5. Prediction Retrieval ──────────────────────────────────────────────────

def test_get_predictions_by_user(db):
    """Test retrieving all predictions for a user."""
    user = crud.create_user(db, schemas.UserCreate(
        name="Bob", email="bob@example.com", password="pass123"
    ))
    for i in range(3):
        crud.create_prediction(db, schemas.PredictionCreate(
            user_id=user.id,
            text=f"Test news article number {i} for testing",
            prediction="REAL" if i % 2 == 0 else "FAKE",
            confidence=0.75,
            model_name="BERT",
            model_version="1.0.0",
            inference_time_ms=100
        ))
    predictions = crud.get_predictions_by_user(db, user.id)
    assert len(predictions) == 3


# ─── 6. Prediction Deletion ───────────────────────────────────────────────────

def test_delete_prediction(db):
    """Test that a prediction can be deleted."""
    user = crud.create_user(db, schemas.UserCreate(
        name="Carol", email="carol@example.com", password="pass123"
    ))
    pred = crud.create_prediction(db, schemas.PredictionCreate(
        user_id=user.id,
        text="Deletable prediction test text here.",
        prediction="REAL",
        confidence=0.9,
        model_name="BERT",
        model_version="1.0.0",
        inference_time_ms=120
    ))
    pred_id = pred.id
    crud.delete_prediction(db, pred_id)
    assert crud.get_prediction(db, pred_id) is None


# ─── 7. User Isolation ────────────────────────────────────────────────────────

def test_user_isolation(db):
    """
    CRITICAL: User A must NOT be able to see User B's predictions.
    """
    user_a = crud.create_user(db, schemas.UserCreate(
        name="User A", email="usera@example.com", password="passA123"
    ))
    user_b = crud.create_user(db, schemas.UserCreate(
        name="User B", email="userb@example.com", password="passB123"
    ))

    # Create predictions for each user
    for i in range(2):
        crud.create_prediction(db, schemas.PredictionCreate(
            user_id=user_a.id,
            text=f"User A's private article number {i} for isolation test",
            prediction="REAL",
            confidence=0.8,
            model_name="BERT",
            model_version="1.0.0",
            inference_time_ms=110
        ))
    crud.create_prediction(db, schemas.PredictionCreate(
        user_id=user_b.id,
        text="User B's private secret article about isolation",
        prediction="FAKE",
        confidence=0.6,
        model_name="BERT",
        model_version="1.0.0",
        inference_time_ms=130
    ))

    a_preds = crud.get_predictions_by_user(db, user_a.id)
    b_preds = crud.get_predictions_by_user(db, user_b.id)

    assert len(a_preds) == 2
    assert len(b_preds) == 1

    # User A's predictions must NOT contain User B's data
    a_ids = {p.user_id for p in a_preds}
    assert user_b.id not in a_ids

    # User B's predictions must NOT contain User A's data
    b_ids = {p.user_id for p in b_preds}
    assert user_a.id not in b_ids


# ─── 8. Model Creation ────────────────────────────────────────────────────────

def test_create_model(db):
    """Test ML model metadata creation."""
    ml_model = crud.create_model(db, schemas.MLModelCreate(
        name="BERT Fake News Classifier",
        version="1.0.0",
        status="Active",
        model_path="models/bert_fake_news/"
    ))
    assert ml_model.id is not None
    assert ml_model.version == "1.0.0"


# ─── 9. Evaluation Creation ───────────────────────────────────────────────────

def test_create_evaluation(db):
    """Test evaluation metrics creation with model/dataset linkage."""
    ml_model = crud.create_model(db, schemas.MLModelCreate(
        name="BERT", version="1.0.0", status="Active", model_path="models/"
    ))
    dataset = crud.create_dataset(db, schemas.DatasetCreate(
        name="Test Dataset",
        filename="test.csv",
        total_rows=1000,
        real_count=500,
        fake_count=500
    ))
    evaluation = crud.create_evaluation(db, schemas.EvaluationCreate(
        model_id=ml_model.id,
        dataset_id=dataset.id,
        accuracy=0.985,
        precision=0.982,
        recall=0.988,
        f1=0.985,
        test_samples=1000
    ))
    assert evaluation.id is not None
    assert evaluation.accuracy == 0.985
    assert evaluation.model_id == ml_model.id
    assert evaluation.dataset_id == dataset.id


def test_predictions_sql_filtering_and_search(db):
    user = crud.create_user(db, schemas.UserCreate(
        name="Query User", email="query@example.com", password="passQuery123"
    ))
    crud.create_prediction(db, schemas.PredictionCreate(
        user_id=user.id, text="Breaking: Secret discovery found in space", prediction="FAKE",
        confidence=0.91, model_name="BERT", model_version="1.0.0", inference_time_ms=100
    ))
    crud.create_prediction(db, schemas.PredictionCreate(
        user_id=user.id, text="Verified: Climate changes reported by scientists", prediction="REAL",
        confidence=0.82, model_name="BERT", model_version="1.0.0", inference_time_ms=110
    ))
    crud.create_prediction(db, schemas.PredictionCreate(
        user_id=user.id, text="Economy grows according to recent reports", prediction="REAL",
        confidence=0.95, model_name="BERT", model_version="1.0.0", inference_time_ms=90
    ))

    # Test filtering by label
    real_items, total_real = crud.get_predictions_by_user(db, user.id, filter_label="REAL", include_total=True)
    assert total_real == 2
    assert len(real_items) == 2
    assert all(p.prediction == "REAL" for p in real_items)

    fake_items, total_fake = crud.get_predictions_by_user(db, user.id, filter_label="FAKE", include_total=True)
    assert total_fake == 1
    assert fake_items[0].prediction == "FAKE"

    # Test search (case-insensitive)
    space_items, total_space = crud.get_predictions_by_user(db, user.id, search="secret", include_total=True)
    assert total_space == 1
    assert "space" in space_items[0].text.lower()

    # Test sorting by confidence descending
    sorted_items, _ = crud.get_predictions_by_user(db, user.id, sort="highest_conf", include_total=True)
    assert sorted_items[0].confidence >= sorted_items[1].confidence >= sorted_items[2].confidence

