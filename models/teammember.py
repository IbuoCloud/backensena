from pydantic import BaseModel
from typing import Optional

def create_team_members_table(db):
    cursor = db.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS team_members (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            avatarUrl VARCHAR(255)
        )
    ''')
    cursor.close()

class TeamMember(BaseModel):
    id: Optional[int]
    name: str
    avatarUrl: Optional[str] = None 