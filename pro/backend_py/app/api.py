from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .database import SessionLocal
from . import schemas, crud

router = APIRouter(prefix="/api")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -------- Projects --------

@router.get("/projects", response_model=list[schemas.Project])
def read_projects(db: Session = Depends(get_db)):
    return crud.get_projects(db)

@router.post("/projects", response_model=schemas.Project, status_code=201)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_db)):
    return crud.create_project(db, project)

@router.get("/projects/{project_id}", response_model=schemas.Project)
def read_project(project_id: int, db: Session = Depends(get_db)):
    db_obj = crud.get_project(db, project_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Project not found")
    return db_obj

@router.patch("/projects/{project_id}", response_model=schemas.Project)
def update_project(project_id: int, project: schemas.ProjectUpdate, db: Session = Depends(get_db)):
    db_obj = crud.update_project(db, project_id, project)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Project not found")
    return db_obj

@router.delete("/projects/{project_id}", status_code=204)
def delete_project(project_id: int, db: Session = Depends(get_db)):
    success = crud.delete_project(db, project_id)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found")

# -------- Team Members --------

@router.get("/team", response_model=list[schemas.TeamMember])
def read_team(db: Session = Depends(get_db)):
    return crud.get_team_members(db)

@router.post("/team", response_model=schemas.TeamMember, status_code=201)
def create_member(member: schemas.TeamMemberCreate, db: Session = Depends(get_db)):
    return crud.create_team_member(db, member)

@router.patch("/team/{member_id}", response_model=schemas.TeamMember)
def update_member(member_id: int, member: schemas.TeamMemberUpdate, db: Session = Depends(get_db)):
    db_obj = crud.update_team_member(db, member_id, member)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Member not found")
    return db_obj

# -------- Teams --------

@router.get("/teams", response_model=list[schemas.Team])
def read_teams(db: Session = Depends(get_db)):
    return crud.get_teams(db)

@router.post("/teams", response_model=schemas.Team, status_code=201)
def create_team(team: schemas.TeamCreate, db: Session = Depends(get_db)):
    return crud.create_team(db, team)

@router.get("/teams/{team_id}", response_model=schemas.Team)
def read_team(team_id: int, db: Session = Depends(get_db)):
    db_obj = crud.get_team(db, team_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Team not found")
    return db_obj

@router.patch("/teams/{team_id}", response_model=schemas.Team)
def update_team(team_id: int, team: schemas.TeamUpdate, db: Session = Depends(get_db)):
    db_obj = crud.update_team(db, team_id, team)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Team not found")
    return db_obj

@router.delete("/teams/{team_id}", status_code=204)
def delete_team(team_id: int, db: Session = Depends(get_db)):
    success = crud.delete_team(db, team_id)
    if not success:
        raise HTTPException(status_code=404, detail="Team not found")

# More routes (tasks, milestones, events) could be added similarly 