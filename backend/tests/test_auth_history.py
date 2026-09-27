"""
tests/test_auth_history.py
--------------------------
Tests for JWT Authentication, History User Isolation, and IDOR Prevention.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.database import Base, get_db
from app.db import crud, schemas

TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def test_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(test_db):
    def override_get_db():
        try:
            yield test_db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "model_loaded" in data


def test_register_and_login(client):
    # Register
    reg_res = client.post("/api/auth/register", json={
        "name": "Jane Doe",
        "email": "jane@example.com",
        "password": "strongpassword123"
    })
    assert reg_res.status_code == 200
    data = reg_res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "jane@example.com"

    # Login
    login_res = client.post("/api/auth/login", json={
        "email": "jane@example.com",
        "password": "strongpassword123"
    })
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()


def test_history_requires_auth(client):
    # History without token returns 401
    res = client.get("/api/history")
    assert res.status_code == 401


def test_history_idor_protection(client, test_db):
    # Create User A
    user_a = crud.create_user(test_db, schemas.UserCreate(
        name="User A", email="usera@test.com", password="pass123userA"
    ))
    # Create User B
    user_b = crud.create_user(test_db, schemas.UserCreate(
        name="User B", email="userb@test.com", password="pass123userB"
    ))

    # Add prediction for User A
    pred_a = crud.create_prediction(test_db, schemas.PredictionCreate(
        user_id=user_a.id,
        text="User A's private news",
        prediction="REAL",
        confidence=0.95,
        model_name="BERT",
        model_version="1.0.0",
        inference_time_ms=100
    ))

    # Login as User B
    login_b = client.post("/api/auth/login", json={"email": "userb@test.com", "password": "pass123userB"})
    token_b = login_b.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # User B requests User A's history via query param -> 403 Forbidden
    res = client.get(f"/api/history?user_id={user_a.id}", headers=headers_b)
    assert res.status_code == 403

    # User B requests User A's prediction by ID -> 403 Forbidden
    res_item = client.get(f"/api/history/{pred_a.id}", headers=headers_b)
    assert res_item.status_code == 403

    # User B deletes User A's prediction -> 403 Forbidden
    res_del = client.delete(f"/api/history/{pred_a.id}", headers=headers_b)
    assert res_del.status_code == 403


def test_history_authenticated_user_access(client, test_db):
    # Register and create prediction
    reg_res = client.post("/api/auth/register", json={
        "name": "Auth User",
        "email": "auth@example.com",
        "password": "password123"
    })
    token = reg_res.json()["access_token"]
    user_id = reg_res.json()["user"]["id"]
    headers = {"Authorization": f"Bearer {token}"}

    crud.create_prediction(test_db, schemas.PredictionCreate(
        user_id=user_id,
        text="My own article",
        prediction="FAKE",
        confidence=0.88,
        model_name="BERT",
        model_version="1.0.0",
        inference_time_ms=120
    ))

    # Get history
    res = client.get("/api/history", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 1
    assert data["items"][0]["text"] == "My own article"
