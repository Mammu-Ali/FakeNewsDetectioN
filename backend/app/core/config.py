from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "TruthGuard API"
    APP_VERSION: str = "0.1.0"
    FRONTEND_URL: str = "http://localhost:5173"
    ENVIRONMENT: str = "development"
    DATABASE_URL: str = ""
    JWT_SECRET: str = "supersecretkey_change_me_in_production"
    MODEL_PATH: str = "../models/bert_fake_news/"

    model_config = {"env_file": ".env", "extra": "ignore"}

settings = Settings()
