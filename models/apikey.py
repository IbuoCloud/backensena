from pydantic import BaseModel
from typing import Optional

def create_apikeys_table(db):
    cursor = db.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS api_keys (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            name VARCHAR(255) NOT NULL,
            api_key VARCHAR(255) NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        )
    ''')
    cursor.close()

class APIKey(BaseModel):
    id: Optional[int]
    user_id: Optional[int]
    name: str
    api_key: str
    created_at: Optional[str] 