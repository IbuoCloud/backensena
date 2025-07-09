from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
import mysql.connector
from typing import Dict

app = FastAPI(title="DB Service para API Keys (Percona/MySQL)")

# Configuración de conexión a Percona/MySQL
DB_CONFIG = {
    "host": "db.12.ibuo.io",
    "user": "root",
    "password": "rootpass",
    "database": "taskmanager"
}

def get_db():
    return mysql.connector.connect(**DB_CONFIG)

class APIKeyCreate(BaseModel):
    name: str

def ensure_table_exists(table_name: str):
    db = get_db()
    cursor = db.cursor()
    if table_name == "api_keys":
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS api_keys (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            api_key VARCHAR(255) NOT NULL UNIQUE
        )
        """)
    elif table_name == "users":
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)
    elif table_name == "tasks":
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            status ENUM('pending', 'in_progress', 'completed', 'archived') DEFAULT 'pending',
            due_date DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
        """)
    # Agrega más tablas según sea necesario
    cursor.close()
    db.close()

@app.get("/validate-key")
def validate_key(key: str):
    ensure_table_exists("api_keys")
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM api_keys WHERE api_key = %s", (key,))
    result = cursor.fetchone()
    cursor.close()
    db.close()
    return {"valid": bool(result)}

@app.get("/list-keys")
def list_keys():
    ensure_table_exists("api_keys")
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT name, api_key FROM api_keys")
    keys = {row["name"]: row["api_key"] for row in cursor.fetchall()}
    cursor.close()
    db.close()
    return {"keys": keys}

@app.post("/create-key")
def create_key(data: APIKeyCreate):
    import secrets
    ensure_table_exists("api_keys")
    new_key = secrets.token_urlsafe(24)
    db = get_db()
    cursor = db.cursor()
    cursor.execute("INSERT INTO api_keys (name, api_key) VALUES (%s, %s)", (data.name, new_key))
    db.commit()
    cursor.close()
    db.close()
    return {"name": data.name, "api_key": new_key} 