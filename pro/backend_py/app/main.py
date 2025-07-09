from fastapi import FastAPI
from .database import Base, engine
from .api import router

# Crear tablas si no existen
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Project Tracker API")

app.include_router(router)

@app.get("/")
async def root():
    return {"message": "API running"} 