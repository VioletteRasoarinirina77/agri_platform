import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.engine import URL

DB_USER = os.getenv("POSTGRES_USER", "postgres")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD", "violette")
DB_HOST = os.getenv("POSTGRES_HOST", "price-db")
DB_PORT = os.getenv("POSTGRES_PORT", "5432")

# Compat local Windows: si tu utilises Docker pour les conteneurs Postgres,
# le port exposé est 5434 (price-db:5434 -> container:5432).
# On te laisse l'override via POSTGRES_PORT, mais on met aussi un fallback utile.
if DB_HOST in ("localhost", "127.0.0.1") and os.getenv("POSTGRES_PORT") is None:
    DB_PORT = "5434"
DB_NAME = os.getenv("POSTGRES_DB", "price_db")

url = URL.create(
    drivername="postgresql+psycopg2",
    username=DB_USER,
    password=DB_PASSWORD,
    host=DB_HOST,
    port=int(DB_PORT),
    database=DB_NAME
)

engine = create_engine(url)

SessionLocal = sessionmaker(bind=engine)

def init_db():
    with engine.connect() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS prices (
                id SERIAL PRIMARY KEY,
                produit VARCHAR(100),
                prix FLOAT,
                unite VARCHAR(20)
            );
        """))

        conn.commit()

        print("Table prices créée.")