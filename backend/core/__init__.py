import logging
from pathlib import Path
from typing import Final, LiteralString

import ws
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.routing import APIRouter, Mount
from fastapi.staticfiles import StaticFiles
from uvicorn import Config, Server

from core.exceptions import RulesError

logging.basicConfig(
    format='{levelname}: {message}',
    datefmt='%m/%d/%Y %H:%M:%S',
    style='{',
    level=logging.INFO,
)

_API_PREFIX: LiteralString = '/api'
_FRONTEND: Final[Path] = Path.cwd() / Path('dist')

# Initialize the application and set the appropriate routes
app: FastAPI = FastAPI(
    debug=True,
    routes=[
        Mount('/assets', StaticFiles(directory=_FRONTEND / 'assets')),
        Mount('/ws', ws.app),
    ],
)


@app.get('/')
async def render_index() -> FileResponse:
    return FileResponse(_FRONTEND / 'index.html')


@app.get('/sb')
async def render_generic(request: Request) -> FileResponse:
    return FileResponse(_FRONTEND / (request.url.path[1:] + '.html'))


@app.exception_handler(RulesError)
async def rules_error_handler(request: Request, e: RulesError) -> JSONResponse:
    return JSONResponse(
        status_code=409,
        content={'message': str(e)},
    )


def load_api(router: APIRouter) -> None:
    app.include_router(router, prefix=_API_PREFIX)


async def run(host: str = '0.0.0.0', port: int = 8000) -> None:
    # Configure the server
    server: Server = Server(
        Config(
            app,
            host=host,
            port=port,
            log_config=None,
            access_log=False,
            log_level='warning',
            server_header=False,
        )
    )

    await server.serve()
