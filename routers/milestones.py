from fastapi import APIRouter, HTTPException, Query
from models.milestone import Milestone, create_milestones_table
from db import get_db
from typing import List, Optional

router = APIRouter(prefix="/api/milestones", tags=["milestones"])

@router.on_event("startup")
def startup():
    db = get_db()
    if db:
        create_milestones_table(db)
        db.close()

@router.get("/", response_model=List[Milestone])
def list_milestones(projectId: Optional[int] = Query(None)):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    if projectId:
        cursor.execute("SELECT * FROM milestones WHERE projectId=%s", (projectId,))
    else:
        cursor.execute("SELECT * FROM milestones")
    milestones = [Milestone(**row) for row in cursor.fetchall()]
    cursor.close()
    db.close()
    return milestones

@router.post("/", response_model=Milestone)
def create_milestone(milestone: Milestone):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("INSERT INTO milestones (projectId, title, date) VALUES (%s, %s, %s)", (milestone.projectId, milestone.title, milestone.date))
    db.commit()
    milestone.id = cursor.lastrowid
    cursor.close()
    db.close()
    return milestone

@router.patch("/{milestone_id}", response_model=Milestone)
def update_milestone(milestone_id: int, milestone: Milestone):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("UPDATE milestones SET projectId=%s, title=%s, date=%s WHERE id=%s", (milestone.projectId, milestone.title, milestone.date, milestone_id))
    db.commit()
    cursor.close()
    db.close()
    milestone.id = milestone_id
    return milestone 