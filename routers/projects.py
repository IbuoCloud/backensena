from fastapi import APIRouter, HTTPException, Depends
from models.project import Project, create_projects_table
from models.teammember import TeamMember, create_team_members_table
from models.project_team import create_project_team_table
from db import get_db
from typing import List

router = APIRouter(prefix="/api/projects", tags=["projects"])

@router.on_event("startup")
def startup():
    db = get_db()
    if db:
        create_projects_table(db)
        create_team_members_table(db)
        create_project_team_table(db)
        db.close()

@router.get("/", response_model=List[Project])
def list_projects():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM projects")
    projects = [Project(**row) for row in cursor.fetchall()]
    cursor.close()
    db.close()
    return projects

@router.get("/{project_id}", response_model=Project)
def get_project(project_id: int):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM projects WHERE id = %s", (project_id,))
    row = cursor.fetchone()
    cursor.close()
    db.close()
    if not row:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    return Project(**row)

@router.post("/", response_model=Project)
def create_project(project: Project):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("INSERT INTO projects (name, description, clientName, startDate, endDate, status, progress) VALUES (%s, %s, %s, %s, %s, %s, %s)", (project.name, project.description, project.clientName, project.startDate, project.endDate, project.status, project.progress))
    db.commit()
    project.id = cursor.lastrowid
    cursor.close()
    db.close()
    return project

@router.put("/{project_id}", response_model=Project)
def update_project(project_id: int, project: Project):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("UPDATE projects SET name=%s, description=%s, clientName=%s, startDate=%s, endDate=%s, status=%s, progress=%s WHERE id=%s", (project.name, project.description, project.clientName, project.startDate, project.endDate, project.status, project.progress, project_id))
    db.commit()
    cursor.close()
    db.close()
    return project

@router.delete("/{project_id}")
def delete_project(project_id: int):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("DELETE FROM projects WHERE id=%s", (project_id,))
    db.commit()
    cursor.close()
    db.close()
    return {"ok": True}

@router.get("/{project_id}/team", response_model=List[TeamMember])
def get_project_team(project_id: int):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT tm.* FROM team_members tm
        JOIN project_team pt ON tm.id = pt.team_member_id
        WHERE pt.project_id = %s
    """, (project_id,))
    members = [TeamMember(**row) for row in cursor.fetchall()]
    cursor.close()
    db.close()
    return members

@router.post("/{project_id}/team")
def assign_team_members(project_id: int, member_ids: List[int]):
    db = get_db()
    cursor = db.cursor()
    for member_id in member_ids:
        cursor.execute("INSERT IGNORE INTO project_team (project_id, team_member_id) VALUES (%s, %s)", (project_id, member_id))
    db.commit()
    cursor.close()
    db.close()
    return {"ok": True}

@router.delete("/{project_id}/team/{member_id}")
def remove_team_member(project_id: int, member_id: int):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("DELETE FROM project_team WHERE project_id=%s AND team_member_id=%s", (project_id, member_id))
    db.commit()
    cursor.close()
    db.close()
    return {"ok": True} 