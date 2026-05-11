from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Metadatos de la API
    PROJECT_NAME: str = "Stocker API"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Backend para Sistema de Gestión de Almacenes"

    # URL del Frontend con fallback (si no está en .env, usa localhost:5173)
    FRONTEND_URL: str = "http://localhost:5173"

    # Variables de Base de Datos
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_SERVER: str = "db"  # "db" para Docker, "localhost" para local
    POSTGRES_PORT: str = "5432"
    POSTGRES_DB: str = "stocker"

    # JWT — sobreescribir SECRET_KEY en producción vía variable de entorno
    SECRET_KEY: str = "changeme-set-a-real-secret-in-env"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    @property
    def DATABASE_URL(self) -> str:
        user_pass = f"{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
        server_port = f"{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}"
        return f"postgresql://{user_pass}@{server_port}/{self.POSTGRES_DB}"

    model_config = SettingsConfigDict(env_file=".env")


# Instanciamos para que otros archivos puedan importar 'settings'
settings = Settings()
