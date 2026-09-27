import logging
from pydantic import model_validator
from pydantic_settings import BaseSettings

logger = logging.getLogger(__name__)

DEFAULT_INSECURE_SECRET = "supersecretkey_change_me_in_production"

class Settings(BaseSettings):
    APP_NAME: str = "TruthGuard API"
    APP_VERSION: str = "0.1.0"
    FRONTEND_URL: str = "http://localhost:5173"
    ENVIRONMENT: str = "development"
    DATABASE_URL: str = ""
    JWT_SECRET: str = DEFAULT_INSECURE_SECRET
    MODEL_PATH: str = "../models/bert_fake_news/"

    model_config = {"env_file": ".env", "extra": "ignore"}

    @model_validator(mode="after")
    def validate_production_secrets(self) -> "Settings":
        if self.ENVIRONMENT == "production":
            if not self.JWT_SECRET or self.JWT_SECRET == DEFAULT_INSECURE_SECRET or len(self.JWT_SECRET) < 32:
                raise ValueError(
                    "CRITICAL SECURITY CONFIGURATION ERROR: "
                    "JWT_SECRET must be set to a secure, random string (minimum 32 characters) in production."
                )
        elif self.JWT_SECRET == DEFAULT_INSECURE_SECRET:
            logger.warning("Using default insecure JWT_SECRET in non-production environment.")
        return self

settings = Settings()

