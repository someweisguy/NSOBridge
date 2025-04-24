import json
import os
from pathlib import Path
from typing import Final

from fastapi import FastAPI, Request, Response
from fastapi.responses import FileResponse
from fastapi.routing import Mount
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from server import updater

from .api.series import router as series_router

FRONTEND: Final[Path] = Path(os.getcwd()) / 'frontend' / 'dist'
TEMPLATES: Final[Jinja2Templates] = Jinja2Templates(FRONTEND)

CLIENT_ID_COOKIE_NAME: Final[str] = 'client_id'


app: FastAPI = FastAPI(
    routes=[
        Mount('/assets', StaticFiles(directory=FRONTEND / 'assets')),
        Mount('/ws', updater.app),
    ],
    debug=True,
)

app.include_router(series_router, prefix='/api')


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


@app.middleware('http')
async def handle_ws_updates(request: Request, call_next) -> Response:
    response: Response = await call_next(request)
    updater.broadcast()
    return response
