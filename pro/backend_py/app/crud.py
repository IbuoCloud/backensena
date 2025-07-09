from sqlalchemy.orm import Session
from . import models, schemas

# ---------- Projects ----------

def get_projects(db: Session):
    return db.query(models.Project).all()

def get_project(db: Session, project_id: int):
    return db.query(models.Project).filter(models.Project.id == project_id).first()

def create_project(db: Session, project: schemas.ProjectCreate):
    db_obj = models.Project(**project.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_project(db: Session, project_id: int, project_update: schemas.ProjectUpdate):
    db_obj = get_project(db, project_id)
    if not db_obj:
        return None
    for field, value in project_update.model_dump(exclude_unset=True).items():
        setattr(db_obj, field, value)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_project(db: Session, project_id: int):
    db_obj = get_project(db, project_id)
    if not db_obj:
        return False
    db.delete(db_obj)
    db.commit()
    return True

# Similar helpers can be written for tasks, members, milestones, events (se muestran algunos ejemplos)

# ---------- Team Members ----------

def get_team_members(db: Session):
    return db.query(models.TeamMember).all()

def create_team_member(db: Session, member: schemas.TeamMemberCreate):
    db_obj = models.TeamMember(**member.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_team_member(db: Session, member_id: int, member_update: schemas.TeamMemberUpdate):
    db_obj = db.query(models.TeamMember).filter(models.TeamMember.id == member_id).first()
    if not db_obj:
        return None
    for field, value in member_update.model_dump(exclude_unset=True).items():
        setattr(db_obj, field, value)
    db.commit()
    db.refresh(db_obj)
    return db_obj

# ---------- Teams ----------

def get_teams(db: Session):
    return db.query(models.Team).all()

def get_team(db: Session, team_id: int):
    return db.query(models.Team).filter(models.Team.id == team_id).first()

def create_team(db: Session, team: schemas.TeamCreate):
    db_obj = models.Team(**team.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_team(db: Session, team_id: int, team_update: schemas.TeamUpdate):
    db_obj = get_team(db, team_id)
    if not db_obj:
        return None
    for field, value in team_update.model_dump(exclude_unset=True).items():
        setattr(db_obj, field, value)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_team(db: Session, team_id: int):
    db_obj = get_team(db, team_id)
    if not db_obj:
        return False
    db.delete(db_obj)
    db.commit()
    return True

# ---------- Tasks ----------

def get_tasks(db: Session, project_id: int | None = None):
    q = db.query(models.Task)
    if project_id is not None:
        q = q.filter(models.Task.project_id == project_id)
    return q.all() 