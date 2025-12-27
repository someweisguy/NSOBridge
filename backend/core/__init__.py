"""Core NSO Bridge dependencies.

This file contains the core functions needed to run NSO Bridge.
"""

import logging
from pathlib import Path
from typing import Final, LiteralString

import ws
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.routing import APIRouter, Mount
from fastapi.staticfiles import StaticFiles
from uvicorn import Config, Server

from core.exceptions import ClientError

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
async def _render_index() -> FileResponse:
    return FileResponse(_FRONTEND / 'index.html')


@app.get('/sb')
async def _render_generic(request: Request) -> FileResponse:
    # Render generic HTML files found in the frontend directory.
    # Don't forget to register new files with the FastAPI app!
    return FileResponse(_FRONTEND / (request.url.path[1:] + '.html'))


@app.exception_handler(ClientError)
async def _rules_error_handler(request: Request, e: ClientError) -> JSONResponse:
    return JSONResponse(
        status_code=409,
        content={'message': str(e)},
    )


def load_api(router: APIRouter) -> None:
    """Load an API router into the core application.

    Args:
        router (APIRouter): A FastAPI router with endpoints to attach to the
        application.

    """
    app.include_router(router, prefix=_API_PREFIX)


async def run(host: str = '0.0.0.0', port: int = 8000) -> None:
    """Asynchronously serve the application on the desired host and port.

    Args:
        host (str, optional): The desired host on which to serve the app. Defaults to
        '0.0.0.0'.
        port (int, optional): The desired port on which to serve the app. Defaults to
        8000.

    Raises:
        ValueError: if the port number provided is invalid.

    """
    MAX_PORT_NUM: Final[int] = 65535
    if 0 >= port > MAX_PORT_NUM:
        raise ValueError('Invalid port number')

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
