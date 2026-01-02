"""Core services including database engine management."""

from __future__ import annotations

import logging
import os
import sys
from datetime import datetime
from logging import Handler, StreamHandler
from pathlib import Path
from typing import TYPE_CHECKING, ClassVar, Final, LiteralString, Protocol

import colorlog
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.routing import Mount
from fastapi.staticfiles import StaticFiles
from sqlalchemy.engine import URL
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from uvicorn import Config, Server

from core.schemas import APISchema

from .exceptions import ClientError
from .schemas import ErrorSchema, VersionSchema

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncEngine
    from sqlalchemy.orm import DeclarativeBase


logging.getLogger('aiosqlite').setLevel(logging.CRITICAL)

FRONTEND: Final[Path] = Path.cwd() / Path('dist')
DEBUG: Final[bool] = os.environ.get('SQLALCHEMY_DEBUG', '').lower() in {'true', 'yes'}
PAGES_TAG = 'Pages'


class Memento(Protocol):
    """Represent a memento point-in-time of the application state.

    Mementos can be used to implement functionality such as undo and redo by restoring
    the application to a previous state.
    """

    async def restore(self) -> Memento:
        """Restore the state of the application to when this Memento was constructed.

        Returns:
            Memento: A Memento of the state of the application before this method was
            called. Calling `restore()` on this newly created Memento has the effect of
            redoing an operation.

        """
        ...


class DatabaseEngine:
    """A connection to a database which stores models.

    Attributes:
        path (str): the relative path to the database.

    """

    _DRIVER: ClassVar[Final[str]] = 'sqlite+aiosqlite'

    def __init__(self, db_schema: type[DeclarativeBase], db_path: str = '') -> None:
        """Create a database engine without connecting to the database.

        Args:
            db_schema (type[DeclarativeBase]): a SQLAlchemy base model type which will
            be initialized with the database.
            db_path (str, optional): The relative path to the database. If left blank,
            a database in memory will be used. Defaults to ''.

        Raises:
            ValueError: if the db_path is not a legal file name.

        """
        # TODO: ensure that path is a legal file name
        if not db_path.isprintable():
            logging.error('invalid database pathname')
            raise ValueError('db path is invalid')
        self._db_schema: type[DeclarativeBase] = db_schema
        self._session_factory: async_sessionmaker[AsyncSession] | None = None
        self.path: Final[str] = db_path if db_path != '' else ':memory:'

    async def create_all(self) -> None:
        """Initialize the connection to the database and create all tables.

        Raises:
            RuntimeError: if the database connection has already been established.

        """
        if self._session_factory is not None:
            logging.error('the database has already been created')
            raise RuntimeError('the database has already been created')

        # Initialize the database engine
        url: URL = URL.create(self._DRIVER, database=self.path)
        logging.debug(f'Initializing engine at "{str(url)}"')
        engine: AsyncEngine = create_async_engine(url, echo=False)

        # Create the database tables
        async with engine.connect() as session:
            await session.run_sync(self._db_schema.metadata.create_all)
        self._session_factory = async_sessionmaker(bind=engine, expire_on_commit=False)

    def is_connected(self) -> bool:
        """Return True if the database is connected.

        Returns:
            bool: True if the database is connected.

        """
        return self._session_factory is not None

    def get_async_session_factory(self) -> async_sessionmaker[AsyncSession]:
        """Return a session factory that is associated with the database engine.

        Raises:
            RuntimeError: if the database has not yet been created.

        Returns:
            async_sessionmaker: an asynchronous session factory.

        """
        if self._session_factory is None:
            raise RuntimeError('the database has not been created yet')
        return self._session_factory

    def get_async_session(self) -> AsyncSession:
        """Return a session that is associated with the database engine.

        Raises:
            RuntimeError: if the database has not yet been created.

        Returns:
            AsyncSession: an asynchronous session.

        """
        factory: async_sessionmaker[AsyncSession] = self.get_async_session_factory()
        return factory()


# Initialize the application and set the appropriate routes
app: Final[FastAPI] = FastAPI(
    debug=DEBUG,
    routes=[
        Mount('/assets', StaticFiles(directory=FRONTEND / 'assets')),
    ],
    title='NSO Bridge',
    summary='A scoreboard and stats application for roller derby.',
    description="""
    
    """,
    version='v0.1.0-alpha',
    license_info={
        'name': 'MIT License',
        'identifier': 'MIT',
    },
    docs_url='/docs',
)


@app.get('/', tags=[PAGES_TAG], name='Render Index Page')
async def _render_index() -> FileResponse:
    """Render the index page."""
    page_path_name: str = 'index.html'
    logging.info(f'Serving "{page_path_name}"')
    return FileResponse(FRONTEND / page_path_name)


@app.get(
    '/sb',
    tags=[PAGES_TAG],
    name='Render Scoreboard Page',
    description='Render the scoreboard page.',
)
async def _render_generic(request: Request) -> FileResponse:
    # Render generic HTML files found in the frontend directory.
    # Don't forget to register new files with the FastAPI app!
    page_path_name: str = request.url.path[1:] + '.html'
    logging.info(f'Serving "{page_path_name}"')
    return FileResponse(FRONTEND / page_path_name)


@app.get('/version', tags=['Metadata'])
def _get_app_version(request: Request) -> VersionSchema:
    """Return the current version of the app."""
    return VersionSchema(version=request.app.version)


@app.exception_handler(ClientError)
async def _rules_error_handler(request: Request, e: ClientError) -> JSONResponse:
    logging.info(f'{e} ({request.method}: {request.url.path}?{request.url.query})')

    cause: BaseException | None = e.__cause__
    if cause is None:
        return JSONResponse(
            status_code=409,  # TODO: remove magic number
            content={'message': str(e)},
        )

    return JSONResponse(
        status_code=e.status_code,
        content=APISchema(
            status_code=e.status_code,
            error=ErrorSchema(
                type=str(type(cause).__name__), message=str(cause), description=str(e)
            ),
            path=f'{request.url.path}?{request.url.query}',
            method=request.method,
        ).model_dump_json(),
    )


def configure_logging(
    *, log_dir_name: str, log_level: int | None, silent: bool
) -> None:
    """Configure the logging system for the application."""
    datefmt: Final[str] = '%H:%M:%S'

    def get_log_format(*, use_colors: bool = False) -> str:
        """Get a log format string with or without colors."""
        time: LiteralString = '%(asctime)s'
        level: LiteralString = '%(levelname)s'
        if use_colors:
            time = f'%(light_black)s{time}%(reset)s'
            level = f'%(bold)s%(log_color)s{level}%(reset)s'
        return f'{time} {level} %(message)s'

    log_dir: Final[Path] = Path(log_dir_name)
    if not log_dir.exists():
        log_dir.mkdir()
    file: Path = log_dir / Path(f'{datetime.now().strftime("%Y-%m-%d")}.log')
    logging_handlers: list[Handler] = [logging.FileHandler(file, mode='a')]
    if not silent:
        console_logger: StreamHandler = logging.StreamHandler(sys.stdout)
        console_logger.formatter = colorlog.ColoredFormatter(
            fmt=get_log_format(use_colors=True),
            datefmt=datefmt,
            log_colors={
                'DEBUG': 'cyan',
                'INFO': 'green',
                'WARNING': 'yellow',
                'ERROR': 'red',
                'CRITICAL': 'red,bg_white',
            },
        )
        logging_handlers.append(console_logger)
    logging.basicConfig(
        level=log_level,
        format=get_log_format(use_colors=False),
        datefmt=datefmt,
        handlers=logging_handlers,
    )


async def run(host: str, port: int) -> None:
    """Asynchronously serve the application on the desired host and port.

    Args:
        host (str): The desired host on which to serve the app.
        port (int, optional): The desired port on which to serve the app.

    Raises:
        ValueError: if the port number provided is invalid.

    """
    max_port_num: Final[int] = 65535
    if 0 >= port > max_port_num:
        logging.critical('Invalid port number')
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
