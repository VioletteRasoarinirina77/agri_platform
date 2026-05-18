from temporalio import workflow, activity
from datetime import timedelta
import logging
import os

logger = logging.getLogger(__name__)

WEATHER_SERVICE_URL = os.getenv("WEATHER_SERVICE_URL", "http://weather-service:8002")
PRICE_SERVICE_URL = os.getenv("PRICE_SERVICE_URL", "http://price-service:8003")



# =========================
# ACTIVITIES
# =========================

@activity.defn
async def get_weather(region: str) -> dict:
    import httpx

    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{WEATHER_SERVICE_URL}/meteo/{region}")


        resp.raise_for_status()
        return resp.json()


@activity.defn
async def get_prices() -> list:
    import httpx

    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{PRICE_SERVICE_URL}/prix")


        resp.raise_for_status()
        return resp.json()


@activity.defn
async def trigger_spark_job(farmer_data: dict) -> str:
    logger.info(
        f"[Spark] Déclenchement pour {farmer_data['nom']} "
        f"région={farmer_data['region']}"
    )

    return "Spark job triggered"


# =========================
# WORKFLOW
# =========================

@workflow.defn
class FarmerOnboardingWorkflow:

    @workflow.run
    async def run(self, farmer_data: dict) -> dict:

        # météo
        meteo = await workflow.execute_activity(
            get_weather,
            farmer_data["region"],
            schedule_to_close_timeout=timedelta(seconds=10),
        )

        # prix
        prices = await workflow.execute_activity(
            get_prices,
            schedule_to_close_timeout=timedelta(seconds=10),
        )

        # spark
        spark_result = await workflow.execute_activity(
            trigger_spark_job,
            farmer_data,
            schedule_to_close_timeout=timedelta(seconds=30),
        )

        return {
            "status": "processed",
            "meteo": meteo,
            "prices": prices,
            "spark": spark_result,
        }