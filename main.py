from fastapi import FastAPI
from routers.users import router as users_router
from routers.tasks import router as tasks_router
from routers.apikeys import router as apikeys_router
from routers.auth import router as auth_router
from routers.projects import router as projects_router
from routers.team import router as team_router
from routers.milestones import router as milestones_router
from routers.stats import router as stats_router

app = FastAPI(title="Task Manager Modular")

app.include_router(users_router)
app.include_router(tasks_router)
app.include_router(apikeys_router)
app.include_router(auth_router)
app.include_router(projects_router)
app.include_router(team_router)
app.include_router(milestones_router)
app.include_router(stats_router) 