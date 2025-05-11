import os
from datetime import datetime
from pathlib import Path
from typing import Final

from fastapi import FastAPI, Request, Response
from fastapi.responses import FileResponse
from fastapi.routing import Mount
from fastapi.staticfiles import StaticFiles

from server import updater
from server.responses import JSONable

FRONTEND: Final[Path] = Path(os.getcwd()) / 'frontend' / 'dist'

app: FastAPI = FastAPI(
    routes=[
        Mount('/assets', StaticFiles(directory=FRONTEND / 'assets')),
        Mount('/ws', updater.app),
    ],
    debug=True,
)


@app.get('/')
async def render_index(request: Request) -> Response:
    print('render_index called!')
    return await render_generic(request, 'index.html')


@app.get('/{path}')
async def render_generic(request: Request, path: str) -> Response:
    return FileResponse(FRONTEND / path)


@app.get('/api/sync')
async def server_sync() -> JSONable:
    start: datetime = datetime.now()
    return {
        't1': start.isoformat(),
        't2': datetime.now().isoformat(),
    }


@app.middleware('http')
async def broadcast_updates_middleware(request: Request, call_next) -> Response:
    response: Response = await call_next(request)
    if request.method != 'GET':
        updater.broadcast()
    return response
