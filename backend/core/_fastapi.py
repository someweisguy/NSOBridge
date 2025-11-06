import os
from collections.abc import AsyncGenerator, Awaitable
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any, Callable, Final

from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.routing import Mount
from fastapi.staticfiles import StaticFiles

from ._database import engine
from ._models import BaseModel, RulesError
from ._ws import ws_app

FRONTEND: Final[Path] = Path(os.getcwd()) / 'dist'
STARTUP_CALLBACKS: list[Callable[[], Awaitable[Any]]] = []
SHUTDOWN_CALLBACKS: list[Callable[[], Awaitable[Any]]] = []


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncGenerator[None, None]:
    # First initialize the connection to the database
    async with engine.connect() as database:
        await database.run_sync(BaseModel.metadata.create_all)

    for callback in STARTUP_CALLBACKS:
        await callback()
    yield  # Yield control to the FastAPI application
    for callback in SHUTDOWN_CALLBACKS:
        await callback()


app: FastAPI = FastAPI(
    debug=True,
    lifespan=lifespan,
    routes=[
        Mount('/assets', StaticFiles(directory=FRONTEND / 'assets')),
        Mount('/ws', ws_app),
    ],
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


def startup(callback: Callable[[], Awaitable[Any]]) -> Callable[[], Awaitable[Any]]:
    STARTUP_CALLBACKS.append(callback)
    return callback


def shutdown(callback: Callable[[], Awaitable[Any]]) -> Callable[[], Awaitable[Any]]:
    SHUTDOWN_CALLBACKS.append(callback)
    return callback
