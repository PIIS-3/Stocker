from sqlmodel import create_engine, Session
from .core.config import settings

# Usamos la URL centralizada en settings
engine = create_engine(settings.DATABASE_URL)

# Dependency to get the DB Session per request
def get_db():
    with Session(engine) as session:
        yield session