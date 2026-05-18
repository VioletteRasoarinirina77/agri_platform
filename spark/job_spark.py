# spark/job_spark.py
from pyspark.sql import SparkSession
from pyspark.sql.functions import from_json, col, sum, count
from pyspark.sql.types import StructType, StructField, StringType, FloatType

spark = SparkSession.builder \
    .appName("AgriDataPipeline") \
    .config("spark.sql.streaming.schemaInference", "true") \
    .getOrCreate()

schema = StructType([
    StructField("type", StringType()),
    StructField("nom", StringType()),
    StructField("region", StringType()),
    StructField("culture", StringType()),
    StructField("surface", FloatType())
])

# Lecture du flux Kafka
df = spark.readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "kafka:9092") \
    .option("subscribe", "agriculteurs-topic") \
    .option("startingOffsets", "latest") \
    .load() \
    .select(from_json(col("value").cast("string"), schema).alias("data")) \
    .select("data.*") \
    .filter(col("type") == "AGRICULTEUR_CREATED")

# Agrégation
agg_df = df.groupBy("region", "culture") \
    .agg(
        count("*").alias("nb_agriculteurs"),
        sum("surface").alias("surface_totale")
    )

# Fonction d'écriture dans PostgreSQL
def write_to_postgres(df, epoch_id):
    df.write \
        .format("jdbc") \
        .option("url", "jdbc:postgresql://agri_postgres:5432/agri_platform")
        .option("dbtable", "stats_agriculture") \
        .option("user", "postgres") \
        .option("password", "violette") \
        .mode("append") \
        .save()

# Lancer la requête
query = agg_df.writeStream \
    .foreachBatch(write_to_postgres) \
    .outputMode("update") \
    .start()

query.awaitTermination()