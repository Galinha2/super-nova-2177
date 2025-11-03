from fastapi import FastAPI
from .db_models import Base, engine

Base.metadata.create_all(bind=engine)
print("Database tables created successfully.")

app = FastAPI()

# restante do código do backend...
