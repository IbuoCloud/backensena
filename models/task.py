from pydantic import BaseModel
from typing import Optional

def create_tasks_table(db):
    cursor = db.cursor()
    cursor.execute('''
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
    ''')
    cursor.close()

class Task(BaseModel):
    id: Optional[int]
    user_id: int
    title: str
    description: Optional[str]
    status: Optional[str] = 'pending'
    due_date: Optional[str]
    created_at: Optional[str]
    updated_at: Optional[str] 