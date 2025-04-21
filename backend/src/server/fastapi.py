import json
import os
from pathlib import Path
from typing import Final

from fastapi import FastAPI, Request, Response
from fastapi.responses import FileResponse
from fastapi.routing import Mount
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

FRONTEND: Final[Path] = Path(os.getcwd()) / 'frontend' / 'dist'
TEMPLATES: Final[Jinja2Templates] = Jinja2Templates(FRONTEND)

CLIENT_ID_COOKIE_NAME: Final[str] = 'client_id'

app: FastAPI = FastAPI(
    debug=True,
    routes=[
        Mount('/assets', StaticFiles(directory=FRONTEND / 'assets')),
    ],
)


@app.get('/')
async def render_index(request: Request) -> Response:
    print('render_index called!')
    return await render_generic(request, 'index.html')


@app.get('/{path}')
async def render_generic(request: Request, path: str) -> Response:
    if not path.endswith('.html'):
        return FileResponse(FRONTEND / path)
    data: str = json.dumps({}, separators=(',', ':'))
    return TEMPLATES.TemplateResponse(path, {'request': request, 'model': data})
