import os
from datetime import datetime
from pathlib import Path
from typing import Awaitable, Callable, Final, Literal

from fastapi import FastAPI, Request, Response
from fastapi.responses import FileResponse
from fastapi.routing import Mount
from fastapi.staticfiles import StaticFiles

from core.views import ws

FRONTEND: Final[Path] = Path(os.getcwd()) / 'frontend' / 'dist'

app: FastAPI = FastAPI(
    routes=[
        Mount('/assets', StaticFiles(directory=FRONTEND / 'assets')),
        Mount('/ws', ws.app),
    ],
    debug=True,
)


@app.get('/')
async def render_index(request: Request) -> Response:
    return await render_generic(request, 'index.html')


@app.get('/{path}')
async def render_generic(request: Request, path: str) -> Response:
    return FileResponse(FRONTEND / path)


@app.get('/api/sync')
async def server_sync() -> dict[Literal['t1', 't2'], str]:
    # TODO: make this a ProjectModel
    start: datetime = datetime.now()
    return {
        't1': start.isoformat(),
        't2': datetime.now().isoformat(),
    }


@app.middleware('http')
async def broadcast_updates_middleware(
    request: Request, call_next: Callable[[Request], Awaitable[Response]]
) -> Response:
    response: Response = await call_next(request)
    if request.method != 'GET':
        ws.broadcast()
    return response
