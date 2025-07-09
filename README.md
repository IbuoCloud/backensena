# API Modular con FastAPI, API Key, JWT y Swagger

## Instalación

```bash
python -m venv venv
venv/Scripts/activate  # En Windows
pip install -r requirements.txt
```

## Ejecución

```bash
uvicorn main:app --reload
```

## Endpoints principales
- `/panel`: Panel de control para crear y ver API Keys
- `/protected-apikey`: Endpoint protegido por API Key (header `X-API-Key`)
- `/token`: Obtener JWT (usuario: admin, contraseña: admin)
- `/protected-jwt`: Endpoint protegido por JWT
- `/docs`: Documentación Swagger 

## Microservicio de base de datos (Percona/MySQL)

1. Crea la base de datos y tabla:

```sql
CREATE DATABASE apigateway;
USE apigateway;
CREATE TABLE api_keys (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    api_key VARCHAR(255) NOT NULL UNIQUE
);
```

2. Ejecuta el microservicio de base de datos:

```bash
uvicorn db_service:app --port 8001 --reload
```

Asegúrate de que los datos de conexión en `db_service.py` coincidan con tu entorno de Percona/MySQL. 