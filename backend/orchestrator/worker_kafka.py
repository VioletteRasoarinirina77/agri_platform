import asyncio
import json
import logging
import os
from confluent_kafka import Consumer, KafkaError, KafkaException
from temporalio.client import Client
from temporalio.worker import Worker
from workflows import FarmerOnboardingWorkflow, get_weather, get_prices, trigger_spark_job

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
KAFKA_TOPIC = os.getenv("KAFKA_TOPIC", "agriculteurs-topic")
GROUP_ID = os.getenv("KAFKA_GROUP_ID", "temporal-orchestrator")
TEMPORAL_TASK_QUEUE = os.getenv("TEMPORAL_TASK_QUEUE", "farmer-task-queue")
# Temporal: si le worker tourne sur la machine hôte (Windows), "temporal" n'est pas résolu.
# Par défaut on teste d'abord localhost (host), sinon temporal (docker network).
# Ex: TEMPORAL_ADDRESS=localhost:7233
TEMPORAL_ADDRESS = os.getenv("TEMPORAL_ADDRESS", "localhost:7233")



async def consume_forever(consumer, temporal_client):
    """Boucle asynchrone lisant les messages Kafka sans bloquer."""
    loop = asyncio.get_event_loop()
    while True:
        # poll n'est pas asynchrone, mais on l’exécute dans un thread
        msg = await loop.run_in_executor(None, consumer.poll, 1.0)
        if msg is None:
            await asyncio.sleep(0.1)
            continue
        if msg.error():
            if msg.error().code() == KafkaError._PARTITION_EOF:
                continue
            else:
                logger.error(f"Erreur Kafka: {msg.error()}")
                break
        # Traitement du message
        try:
            farmer_data = json.loads(msg.value().decode('utf-8'))
            if farmer_data.get("type") == "AGRICULTEUR_CREATED":
                workflow_id = f"farmer-{farmer_data['nom']}-{farmer_data.get('surface', 0)}"
                logger.info(f"Démarrage du workflow {workflow_id}")
                await temporal_client.start_workflow(
                    FarmerOnboardingWorkflow.run,
                    farmer_data,
                    id=workflow_id,
                    task_queue=TEMPORAL_TASK_QUEUE,
                )
        except Exception as e:
            logger.error(f"Erreur traitement message: {e}")

async def main():
    # Attente courte pour laisser démarrer Kafka/Temporal (surtout en Docker)
    await asyncio.sleep(float(os.getenv("STARTUP_DELAY_SECONDS", "2")))

    # Connexion à Temporal
    # - si worker tourne sur la machine hôte (Windows): TEMPORAL_ADDRESS=localhost:7233
    # - si worker tourne en container: TEMPORAL_ADDRESS=temporal:7233
    logger.info(f"Connexion Temporal avec adresse: {TEMPORAL_ADDRESS}")
    temporal_client = await Client.connect(TEMPORAL_ADDRESS)



    # Démarrer le worker Temporal
    worker = Worker(
        temporal_client,
        task_queue=TEMPORAL_TASK_QUEUE,
        workflows=[FarmerOnboardingWorkflow],
        activities=[get_weather, get_prices, trigger_spark_job],
    )
    asyncio.create_task(worker.run())

    # Configurer le consommateur Kafka
    conf = {
        'bootstrap.servers': KAFKA_BOOTSTRAP_SERVERS,
        'group.id': GROUP_ID,
        'auto.offset.reset': os.getenv('KAFKA_AUTO_OFFSET_RESET', 'earliest'),
        'enable.auto.commit': os.getenv('KAFKA_ENABLE_AUTO_COMMIT', 'true').lower() == 'true',
    }
    consumer = Consumer(conf)
    consumer.subscribe([KAFKA_TOPIC])
    logger.info(f"En attente de messages sur {KAFKA_TOPIC}")

    try:
        await consume_forever(consumer, temporal_client)
    except KeyboardInterrupt:
        logger.info("Arrêt demandé")
    finally:
        consumer.close()

if __name__ == "__main__":
    asyncio.run(main())