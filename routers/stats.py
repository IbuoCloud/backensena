from fastapi import APIRouter
from db import get_db

router = APIRouter(prefix="/api/stats", tags=["stats"])

@router.get("/")
def get_stats():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    # Proyectos activos
    cursor.execute("SELECT COUNT(*) as count FROM projects WHERE status='active'")
    activeProjects = cursor.fetchone()["count"]
    # Proyectos completados
    cursor.execute("SELECT COUNT(*) as count FROM projects WHERE status='completed'")
    completedProjects = cursor.fetchone()["count"]
    # Tareas pendientes y completadas (si hay tabla de tareas)
    try:
        cursor.execute("SELECT COUNT(*) as count FROM tasks WHERE status='pending'")
        pendingTasks = cursor.fetchone()["count"]
        cursor.execute("SELECT COUNT(*) as count FROM tasks WHERE status='completed'")
        completedTasks = cursor.fetchone()["count"]
    except Exception:
        pendingTasks = 0
        completedTasks = 0
    # Tiempo y productividad (mock)
    timeSpent = 0
    productivity = 0
    cursor.close()
    db.close()
    return {
        "activeProjects": activeProjects,
        "completedProjects": completedProjects,
        "pendingTasks": pendingTasks,
        "completedTasks": completedTasks,
        "timeSpent": timeSpent,
        "productivity": productivity
    } 