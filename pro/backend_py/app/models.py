from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .database import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    client_name = Column(String)
    start_date = Column(DateTime(timezone=True), server_default=func.now())
    end_date = Column(DateTime(timezone=True))
    status = Column(String, nullable=False, default="active")
    progress = Column(Integer, nullable=False, default=0)

    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")
    milestones = relationship("Milestone", back_populates="project", cascade="all, delete-orphan")
    events = relationship("Event", back_populates="project", cascade="all, delete-orphan")

class TeamMember(Base):
    __tablename__ = "team_members"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    avatar_url = Column(String)
    team_id = Column(Integer, ForeignKey("teams.id"))

    tasks = relationship("Task", back_populates="assignee")
    team = relationship("Team", back_populates="members")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    status = Column(String, nullable=False, default="todo")
    priority = Column(String, nullable=False, default="medium")
    assignee_id = Column(Integer, ForeignKey("team_members.id"))
    due_date = Column(DateTime(timezone=True))
    completed = Column(Boolean, nullable=False, default=False)
    column = Column(String, nullable=False, default="todo")
    order = Column(Integer, nullable=False, default=0)
    time_spent = Column(Integer, default=0)
    time_estimate = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    project = relationship("Project", back_populates="tasks")
    assignee = relationship("TeamMember", back_populates="tasks")

class Milestone(Base):
    __tablename__ = "milestones"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    title = Column(String, nullable=False)
    date = Column(DateTime(timezone=True), nullable=False)
    completed = Column(Boolean, nullable=False, default=False)

    project = relationship("Project", back_populates="milestones")

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    start = Column(DateTime(timezone=True), nullable=False)
    end = Column(DateTime(timezone=True))
    all_day = Column(Boolean, nullable=False, default=False)
    project_id = Column(Integer, ForeignKey("projects.id"))
    type = Column(String, nullable=False, default="meeting")
    color = Column(String, default="blue")

    project = relationship("Project", back_populates="events")

# Tabla Team
class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    description = Column(Text)
    avatar_url = Column(String)

    members = relationship("TeamMember", back_populates="team") 