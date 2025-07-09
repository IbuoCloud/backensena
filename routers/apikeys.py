from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.responses import HTMLResponse
from models.apikey import APIKey, create_apikeys_table
from db import get_db
from routers.auth import get_admin_user
import secrets

router = APIRouter(prefix="/apikeys", tags=["apikeys"])

@router.on_event("startup")
def startup():
    db = get_db()
    if db:
        create_apikeys_table(db)
        db.close()

@router.post("/", response_model=APIKey)
def create_apikey(apikey: APIKey):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("INSERT INTO api_keys (user_id, name, api_key) VALUES (%s, %s, %s)", (apikey.user_id, apikey.name, apikey.api_key))
    db.commit()
    apikey.id = cursor.lastrowid
    cursor.close()
    db.close()
    return apikey

@router.get("/", response_model=list[APIKey])
def list_apikeys():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM api_keys")
    apikeys = [APIKey(**row) for row in cursor.fetchall()]
    cursor.close()
    db.close()
    return apikeys

@router.get("/panel", response_class=HTMLResponse)
def apikey_panel(request: Request, current_user: dict = Depends(get_admin_user)):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM api_keys")
    apikeys = cursor.fetchall()
    cursor.close()
    db.close()
    html = """
    <html><head><title>Panel API Keys</title></head><body>
    <h1>Panel de API Keys</h1>
    <form method='post' action='/apikeys/panel/create'>
        <input name='name' placeholder='Nombre de la API Key' required />
        <button type='submit'>Crear API Key</button>
    </form>
    <h2>API Keys existentes:</h2>
    <ul>
    """
    for k in apikeys:
        html += f"<li>{k['name']}: {k['api_key']}</li>"
    html += """
    </ul></body></html>
    """
    return html

@router.post("/panel/create", response_class=HTMLResponse)
async def apikey_panel_create(request: Request, current_user: dict = Depends(get_admin_user)):
    form = await request.form()
    name = form.get("name")
    if not name:
        return "<p>Nombre requerido</p><a href='/apikeys/panel'>Volver</a>"
    new_key = secrets.token_urlsafe(24)
    db = get_db()
    cursor = db.cursor()
    cursor.execute("INSERT INTO api_keys (name, api_key) VALUES (%s, %s)", (name, new_key))
    db.commit()
    cursor.close()
    db.close()
    html = f"""
    <html><head><title>API Key creada</title></head><body>
    <h1>API Key creada</h1>
    <p>Nombre: {name}</p>
    <p>API Key: {new_key}</p>
    <a href='/apikeys/panel'>Volver al panel</a>
    </body></html>
    """
    return html 