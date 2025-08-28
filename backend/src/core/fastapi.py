import os
from pathlib import Path
from typing import Final

from fastapi import FastAPI
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
    return await render_generic('index.html')


@app.get('/{path}')
async def render_generic(path: str) -> FileResponse:
    if '.' not in path:
        path += '.html'
    return FileResponse(FRONTEND / path)
