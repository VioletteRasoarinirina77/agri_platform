from fastapi import FastAPI
import requests
import redis
import json
import os


app = FastAPI()



API_KEY = os.getenv("OPENWEATHER_API_KEY")


# REDIS
REDIS_HOST = os.getenv("REDIS_HOST", "redis")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))

r = redis.Redis(
    host=REDIS_HOST,
    port=REDIS_PORT,
    decode_responses=True
)


@app.get("/meteo/{region}")
def obtenir_meteo(region: str):

    # Vérifier cache Redis
    cache = r.get(region)

    if cache:
        return {
            "source": "redis-cache",
            "data": json.loads(cache)
        }

    # API météo
    url = f"https://api.openweathermap.org/data/2.5/weather?q={region},MG&appid={API_KEY}&units=metric"

    response = requests.get(url)
    data = response.json()

    resultat = {
        "region": region,
        "temperature": data["main"]["temp"],
        "humidite": data["main"]["humidity"],
        "etat": data["weather"][0]["description"]
    }

    # Sauvegarde Redis pendant 1 heure
    r.setex(region, 3600, json.dumps(resultat))

    return {
        "source": "api-openweather",
        "data": resultat
    }