"""Core NSO Bridge dependencies.

This file contains the core functions needed to run NSO Bridge.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import TYPE_CHECKING, ClassVar, Final, LiteralString

import ws
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.routing import APIRouter, Mount
from fastapi.staticfiles import StaticFiles
from sqlalchemy.engine import URL
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from uvicorn import Config, Server

from core.exceptions import ClientError

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncEngine
    from sqlalchemy.orm import DeclarativeBase

logging.basicConfig(
    format='{levelname}: {message}',
    datefmt='%m/%d/%Y %H:%M:%S',
    style='{',
    level=logging.INFO,
)

_API_PREFIX: LiteralString = '/api'
_FRONTEND: Final[Path] = Path.cwd() / Path('dist')


class EngineManager:
    _DRIVER: ClassVar[Final[str]] = 'sqlite+aiosqlite:///'

    def __init__(self, db_schema: type[DeclarativeBase], db_path: str = '') -> None:
        # TODO: ensure that path is a legal file name
        if not db_path.isprintable():
            raise ValueError('db path is invalid')
        self._db_schema: type[DeclarativeBase] = db_schema
        self._session_factory: async_sessionmaker | None = None
        self.path: Final[str] = db_path if db_path != '' else ':memory:'

    async def create_all(self) -> None:
        if self._session_factory is not None:
            raise RuntimeError('the database has already been created')

        # Initialize the database engine
        url: URL = URL.create(self._DRIVER, database=self.path)
        engine: AsyncEngine = create_async_engine(url, echo=False)
        self._session_factory = async_sessionmaker(bind=engine, expire_on_commit=False)

        # Create the database tables
        async with engine.connect() as session:
            await session.run_sync(self._db_schema.metadata.create_all)

    def get_async_session_factory(self) -> async_sessionmaker:
        if self._session_factory is None:
            raise RuntimeError('the database has not been created yet')
        return self._session_factory

    def get_async_session(self) -> AsyncSession:
        factory: async_sessionmaker = self.get_async_session_factory()
        return factory()


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
