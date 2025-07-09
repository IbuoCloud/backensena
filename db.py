import mysql.connector
from mysql.connector import Error

DB_CONFIG = {
    "host": "db.12.ibuo.io",
    "user": "root",
    "password": "rootpass",
    "database": "taskmanager"
}

def get_db():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"Error de conexión a la base de datos: {e}")
        return None 