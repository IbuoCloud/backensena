from pydantic import BaseModel
from typing import Optional

def create_projects_table(db):
    cursor = db.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS projects (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            clientName VARCHAR(255),
            startDate DATE,
            endDate DATE,
            status VARCHAR(20) DEFAULT 'active',
            progress INT DEFAULT 0
        )
    ''')
    cursor.close()

class Project(BaseModel):
    id: Optional[int]
    name: str
    description: Optional[str] = None
    clientName: Optional[str] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    status: Optional[str] = 'active'
    progress: Optional[int] = 0 