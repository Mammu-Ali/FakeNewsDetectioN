# TruthGuard - AI Fake News Detection System

TruthGuard is an advanced AI-powered platform for detecting fake news. It features a React frontend, a FastAPI backend, and uses a fine-tuned BERT model for state-of-the-art NLP classification.

## 🚀 Features
- **Real-Time Analysis**: Enter any news article and get an instant REAL/FAKE prediction with confidence scores.
- **Explainable AI**: Provides extracted keywords and reasoning for the model's prediction.
- **Prediction History**: Tracks and manages your past analyzed articles.
- **Model Management**: Dashboard for viewing active ML models, evaluation metrics, and training history.
- **User Authentication**: Secure user registration and login system.

## 🛠️ Technology Stack
- **Frontend**: React, Vite, Tailwind CSS, Recharts
- **Backend**: FastAPI, Python, SQLAlchemy, Uvicorn
- **Machine Learning**: PyTorch, Hugging Face Transformers (BERT)
- **Database**: PostgreSQL (with automatic SQLite fallback for testing)

## 📁 Project Structure
- `/src/` - React frontend source code
- `/backend/` - FastAPI backend application
- `/backend/app/` - Backend business logic and endpoints
- `/backend/app/db/` - Database schemas, models, and CRUD operations
- `/backend/app/ml/` - Machine learning inference service
- `/models/` - Trained models and checkpoints
- `/training/` - Training scripts and evaluation logs

## ⚙️ Setup Instructions

### 1. Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### 2. Database Configuration
The application uses PostgreSQL by default, but will gracefully fall back to SQLite if PostgreSQL is not available or not configured.

Create a `.env` file in the `backend/` directory:
```bash
cp backend/.env.example backend/.env
```

Update the `DATABASE_URL` in `backend/.env` with your PostgreSQL credentials:
```env
DATABASE_URL="postgresql+psycopg2://postgres:YOUR_PASSWORD@localhost:5432/truthguard"
```
*(If left empty, the application will automatically create an SQLite database named `truthguard_dev.db`)*

### 3. Running the Application

**Start the FastAPI backend:**
```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
*Note: The backend will automatically create the required database tables on startup.*

**Start the React frontend:**
In a separate terminal:
```bash
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.

---
*Built for the Fake News Detection DL Project.*
