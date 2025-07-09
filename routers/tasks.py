from fastapi import APIRouter, HTTPException
from models.task import Task, create_tasks_table
from db import get_db

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.on_event("startup")
def startup():
    db = get_db()
    if db:
        create_tasks_table(db)
        db.close()

@router.post("/", response_model=Task)
def create_task(task: Task):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("INSERT INTO tasks (user_id, title, description, status, due_date) VALUES (%s, %s, %s, %s, %s)", (task.user_id, task.title, task.description, task.status, task.due_date))
    db.commit()
    task.id = cursor.lastrowid
    cursor.close()
    db.close()
    return task

@router.get("/", response_model=list[Task])
def list_tasks():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM tasks")
    tasks = [Task(**row) for row in cursor.fetchall()]
    cursor.close()
    db.close()
    return tasks 