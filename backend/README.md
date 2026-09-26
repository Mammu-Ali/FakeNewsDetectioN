# TruthGuard API

AI-powered fake news detection backend for TruthGuard.

## Setup

1. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

2. Activate virtual environment:
   ```bash
   # Windows
   venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Environment Variables:
   Copy `.env.example` to `.env` and adjust the variables.

5. Run server:
   ```bash
   uvicorn app.main:app --reload
   ```

API: http://localhost:8000
Swagger: http://localhost:8000/docs
