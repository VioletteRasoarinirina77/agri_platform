import os
import json
import logging
from confluent_kafka import Producer

logging.basicConfig(level=logging.INFO)

logger = logging.getLogger(__name__)

producer = None


# Callback après envoi Kafka
def delivery_report(err, msg):
    if err is not None:
        logger.error(f"Échec livraison : {err}")
    else:
        logger.info(
            f"Message livré à {msg.topic()} "
            f"[partition {msg.partition()}]"
        )


try:

    conf = {

        # IMPORTANT :
        # Windows local  -> localhost:9092
        # Docker network -> kafka:9092
        'bootstrap.servers': os.getenv(
            "KAFKA_BOOTSTRAP_SERVERS",
            "localhost:9092"
        ),

        'client.id': os.getenv(
            "KAFKA_CLIENT_ID",
            "farmer-service"
        ),

        'acks': 'all'
    }

    producer = Producer(conf)

    logger.info(
        "Kafka producer initialisé avec confluent_kafka"
    )

except Exception as e:

    logger.warning(
        f"Impossible de se connecter à Kafka : {e}"
    )


def send_farm_event(data: dict):

    if producer is None:
        logger.warning(
            "Kafka non disponible, événement ignoré."
        )
        return

    try:

        key = data.get('nom')

        producer.produce(

            topic='agriculteurs-topic',

            key=key.encode('utf-8')
            if key else None,

            value=json.dumps(data).encode('utf-8'),

            callback=delivery_report
        )

        # Déclenche réellement l'envoi
        producer.poll(1)

        # Force l'envoi avant fermeture
        producer.flush(10)

        logger.info(f"Message envoyé : {data}")

    except Exception as e:

        logger.error(
            f"Erreur envoi Kafka : {e}"
        )
