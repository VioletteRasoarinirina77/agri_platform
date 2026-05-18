from fastapi import FastAPI
from sqlalchemy import text
from database import engine, init_db

app = FastAPI()

init_db()

@app.get("/prix")
def obtenir_prix():

    with engine.connect() as conn:
        result = conn.execute(text("SELECT * FROM prices"))

        prix = []

        for row in result:
            prix.append({
                "id": row.id,
                "produit": row.produit,
                "prix": row.prix,
                "unite": row.unite
            })

        return prix