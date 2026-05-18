import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.engine import URL

DB_USER = os.getenv("POSTGRES_USER", "postgres")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD", "violette")
DB_HOST = os.getenv("POSTGRES_HOST", "postgres")
DB_PORT = os.getenv("POSTGRES_PORT", "5432")

DB_NAME = os.getenv("POSTGRES_DB", "agri_platform")

url = URL.create(
    drivername="postgresql",
    username=DB_USER,
    password=DB_PASSWORD,
    host=DB_HOST,
    port=int(DB_PORT),
    database=DB_NAME
)

engine = create_engine(url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """Crée la table agriculteurs si elle n'existe pas."""
    with engine.connect() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS agriculteurs (
                id SERIAL PRIMARY KEY,
                nom VARCHAR(100),
                region VARCHAR(100),
                culture VARCHAR(100),
                surface_terrain FLOAT
            );
        """))
        conn.commit()
        print("Table agriculteurs vérifiée/créée.")