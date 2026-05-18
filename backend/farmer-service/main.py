
import logging
from fastapi import FastAPI
from sqlalchemy import text
from database import engine, init_db   # <-- ajout de init_db
from pydantic import BaseModel
from kafka_producer import send_farm_event
import traceback

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

logger.info("Démarrage du module main.py")

try:
    from database import engine, init_db
    logger.info("database importé")
except Exception as e:
    logger.error(f"Erreur import database: {e}")
    raise

try:
    from kafka_producer import send_farm_event
    logger.info("kafka_producer importé")
except Exception as e:
    logger.error(f"Erreur import kafka_producer: {e}")
    raise

app = FastAPI()

# ⚙️ Initialisation de la table au démarrage
init_db()


class Agriculteur(BaseModel):
    nom: str
    region: str
    culture: str
    surface_terrain: float

@app.get("/agriculteurs")
def get_agriculteurs():
    try:
        logger.info("Récupération des agriculteurs...")
        with engine.connect() as conn:
            result = conn.execute(text("SELECT * FROM agriculteurs"))
            rows = result.fetchall()
        logger.info(f"{len(rows)} lignes trouvées")
        # Conversion explicite pour éviter les erreurs de sérialisation
        output = []
        for row in rows:
            d = {}
            for key, value in row._mapping.items():
                # Convertir les types non sérialisables
                if hasattr(value, 'isoformat'):  # datetime
                    value = value.isoformat()
                elif isinstance(value, bytes):
                    value = value.decode('utf-8')
                d[key] = value
            output.append(d)
        return output
    except Exception as e:
        logger.error("Erreur dans GET /agriculteurs")
        traceback.print_exc()
        raise

@app.post("/agriculteurs")
def add_agriculteur(a: Agriculteur):
    try:
        with engine.begin() as conn:
            conn.execute(
                text("""
                    INSERT INTO agriculteurs (nom, region, culture, surface_terrain)
                    VALUES (:nom, :region, :culture, :surface_terrain)
                """),
                {
                    "nom": a.nom,
                    "region": a.region,
                    "culture": a.culture,
                    "surface_terrain": a.surface_terrain
                }
            )
        # 🔥 ENVOI KAFKA
        send_farm_event({
            "type": "AGRICULTEUR_CREATED",
            "nom": a.nom,
            "region": a.region,
            "culture": a.culture,
            "surface": a.surface_terrain
        })
        return {"message": "Agriculteur ajouté avec succès"}
    except Exception as e:
        logger.error("Erreur dans POST /agriculteurs")
        traceback.print_exc()
        raise