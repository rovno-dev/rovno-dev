from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
# LLM context: URL.create handles all escaping (%, @, :, /, etc.) internally,
# so a password with arbitrary characters cannot corrupt the connection string.
# Do NOT revert to string interpolation — it breaks on @ and % in passwords.
DATABASE_URL = URL.create(
    drivername="postgresql+psycopg2",
    username=os.getenv("MAIN_DB_USER"),
    password=os.getenv("MAIN_DB_PASSWORD"),
    host=os.getenv("MAIN_DB_HOST"),
    port=int(os.getenv("MAIN_DB_PORT", "5432")),
    database=os.getenv("MAIN_DB_NAME"),
)
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
