import os
from pathlib import Path
from typing import Final

from fastapi import FastAPI, Request
from fastapi.responses import FileResponse
from fastapi.routing import Mount
from fastapi.staticfiles import StaticFiles

from core import ws

FRONTEND: Final[Path] = Path(os.getcwd()) / 'frontend' / 'dist'


app: FastAPI = FastAPI(
    routes=[
        Mount('/assets', StaticFiles(directory=FRONTEND / 'assets')),
        Mount('/ws', ws.app),
    ],
    debug=True,
)


@app.get('/')
async def render_index() -> FileResponse:
    return FileResponse(FRONTEND / 'index.html')


@app.get('/sb')
async def render_generic(request: Request) -> FileResponse:
    return FileResponse(FRONTEND / (request.url.path[1:] + '.html'))
