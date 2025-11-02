import os
from pathlib import Path
from typing import Final

from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.routing import Mount
from fastapi.staticfiles import StaticFiles

from .ws import app as ws_handler_app

FRONTEND: Final[Path] = Path(os.getcwd()) / 'dist'


class RulesError(Exception):
    pass


app: FastAPI = FastAPI(
    routes=[
        Mount('/assets', StaticFiles(directory=FRONTEND / 'assets')),
        Mount('/ws', ws_handler_app),
    ],
    debug=True,
)


@app.get('/')
async def render_index() -> FileResponse:
    return FileResponse(FRONTEND / 'index.html')


@app.get('/sb')
async def render_generic(request: Request) -> FileResponse:
    return FileResponse(FRONTEND / (request.url.path[1:] + '.html'))


@app.exception_handler(RulesError)
async def rules_error_handler(request: Request, e: RulesError) -> JSONResponse:
    return JSONResponse(
        status_code=409,
        content={'message': str(e)},
    )
