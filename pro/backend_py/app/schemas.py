from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    client_name: Optional[str] = None
    start_date: datetime = Field(default_factory=datetime.utcnow)
    end_date: Optional[datetime] = None
    status: str = "active"
    progress: int = 0

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str]
    description: Optional[str]
    client_name: Optional[str]
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    status: Optional[str]
    progress: Optional[int]

class Project(ProjectBase):
    id: int

    class Config:
        orm_mode = True

class TeamMemberBase(BaseModel):
    name: str
    role: str
    email: str
    avatar_url: Optional[str] = None
    team_id: Optional[int] = None

class TeamMemberCreate(TeamMemberBase):
    pass

class TeamMemberUpdate(BaseModel):
    name: Optional[str]
    role: Optional[str]
    email: Optional[str]
    avatar_url: Optional[str]
    team_id: Optional[int]

class TeamMember(TeamMemberBase):
    id: int

    class Config:
        orm_mode = True

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    project_id: int
    status: str = "todo"
    priority: str = "medium"
    assignee_id: Optional[int] = None
    due_date: Optional[datetime] = None
    completed: bool = False
    column: str = "todo"
    order: int = 0
    time_spent: int = 0
    time_estimate: Optional[int] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str]
    description: Optional[str]
    status: Optional[str]
    priority: Optional[str]
    assignee_id: Optional[int]
    due_date: Optional[datetime]
    completed: Optional[bool]
    column: Optional[str]
    order: Optional[int]
    time_spent: Optional[int]
    time_estimate: Optional[int]

class Task(TaskBase):
    id: int

    class Config:
        orm_mode = True

class MilestoneBase(BaseModel):
    project_id: int
    title: str
    date: datetime
    completed: bool = False

class MilestoneCreate(MilestoneBase):
    pass

class MilestoneUpdate(BaseModel):
    title: Optional[str]
    date: Optional[datetime]
    completed: Optional[bool]

class Milestone(MilestoneBase):
    id: int

    class Config:
        orm_mode = True

class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    start: datetime
    end: Optional[datetime] = None
    all_day: bool = False
    project_id: Optional[int] = None
    type: str = "meeting"
    color: str = "blue"

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    title: Optional[str]
    description: Optional[str]
    start: Optional[datetime]
    end: Optional[datetime]
    all_day: Optional[bool]
    project_id: Optional[int]
    type: Optional[str]
    color: Optional[str]

class Event(EventBase):
    id: int

    class Config:
        orm_mode = True

# -------- Teams ---------

class TeamBase(BaseModel):
    name: str
    description: Optional[str] = None
    avatar_url: Optional[str] = None

class TeamCreate(TeamBase):
    pass

class TeamUpdate(BaseModel):
    name: Optional[str]
    description: Optional[str]
    avatar_url: Optional[str]

class Team(TeamBase):
    id: int
    class Config:
        orm_mode = True 