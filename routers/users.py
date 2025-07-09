from fastapi import APIRouter, HTTPException
from models.user import User, create_users_table
from db import get_db

router = APIRouter(prefix="/users", tags=["users"])

@router.on_event("startup")
def startup():
    db = get_db()
    if db:
        create_users_table(db)
        db.close()

@router.post("/", response_model=User)
def create_user(user: User):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("INSERT INTO users (username, password_hash, email) VALUES (%s, %s, %s)", (user.username, user.password_hash, user.email))
    db.commit()
    user.id = cursor.lastrowid
    cursor.close()
    db.close()
    return user

@router.get("/", response_model=list[User])
def list_users():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users")
    users = [User(**row) for row in cursor.fetchall()]
    cursor.close()
    db.close()
    return users 