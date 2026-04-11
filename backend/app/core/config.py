from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Stocker API"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Backend para Sistema de Gestión de Almacenes"

    FRONTEND_URL: str = "http://localhost:5173"

    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_SERVER: str = "db"
    POSTGRES_PORT: str = "5432"
    POSTGRES_DB: str = "stocker"

    SECRET_KEY: str = "cambia-esto-en-produccion"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    class Config:
        env_file = ".env"


settings = Settings()