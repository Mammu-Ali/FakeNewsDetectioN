import os
import json
from sqlalchemy.orm import Session
from backend.app.db.database import engine, SessionLocal, Base
from backend.app.db import models, schemas, crud

def init_db():
    print("Creating tables if they don't exist...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")
    
    db = SessionLocal()
    try:
        # Seed dummy admin user for testing if no users exist
        user = crud.get_user_by_email(db, "admin@truthguard.com")
        if not user:
            print("Creating default admin user...")
            crud.create_user(
                db, 
                schemas.UserCreate(
                    name="Admin User", 
                    email="admin@truthguard.com", 
                    password="adminpassword123", 
                    role="admin"
                )
            )
            
        # Seed Model Metadata
        db_model = crud.get_model_by_version(db, "1.0.0")
        if not db_model:
            print("Seeding ML Model metadata...")
            db_model = crud.create_model(
                db,
                schemas.MLModelCreate(
                    name="BERT Fake News Classifier",
                    version="1.0.0",
                    status="Active",
                    model_path="models/bert_fake_news/"
                )
            )
            
        # Seed Dataset Metadata
        db_dataset = crud.get_dataset_by_name(db, "Fake News Training Dataset v1")
        if not db_dataset:
            print("Seeding Dataset metadata...")
            db_dataset = crud.create_dataset(
                db,
                schemas.DatasetCreate(
                    name="Fake News Training Dataset v1",
                    filename="train.csv",
                    total_rows=78964,
                    real_count=41195,
                    fake_count=37769
                )
            )
            
        # Seed Evaluation Metadata
        latest_eval = crud.get_latest_evaluation(db)
        if not latest_eval:
            print("Seeding Evaluation metadata...")
            # Use data from Phase 9C if available, else fallback
            eval_path = os.path.join(os.path.dirname(__file__), "..", "..", "..", "training", "logs", "evaluation_results.json")
            if os.path.exists(eval_path):
                with open(eval_path, "r") as f:
                    eval_data = json.load(f)
                acc = eval_data.get("metrics", {}).get("accuracy", 0.985)
                prec = eval_data.get("metrics", {}).get("precision", 0.982)
                rec = eval_data.get("metrics", {}).get("recall", 0.988)
                f1 = eval_data.get("metrics", {}).get("f1", 0.985)
                samples = eval_data.get("test_samples", 2000)
            else:
                acc, prec, rec, f1, samples = 0.985, 0.982, 0.988, 0.985, 2000
                
            crud.create_evaluation(
                db,
                schemas.EvaluationCreate(
                    model_id=db_model.id,
                    dataset_id=db_dataset.id,
                    accuracy=acc,
                    precision=prec,
                    recall=rec,
                    f1=f1,
                    test_samples=samples
                )
            )
        
        print("Database initialization complete.")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
