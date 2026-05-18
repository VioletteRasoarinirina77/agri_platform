from database import init_db

app = FastAPI()

# Initialiser la base de données au démarrage
init_db()