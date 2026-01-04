"""Core services including database engine management."""

from __future__ import annotations

import json
import logging
import os
import signal
from http import HTTPStatus
from socket import AF_INET, SOCK_DGRAM, socket
from typing import (
    TYPE_CHECKING,
    Any,
    Callable,
    ClassVar,
    Final,
    Mapping,
    Protocol,
    override,
)

from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.engine import URL
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from uvicorn import Config, Server

from .exceptions import ClientError, ModelLookupError
from .schemas import APISchema, ErrorSchema, VersionSchema

if TYPE_CHECKING:
    from fastapi import FastAPI, Request
    from sqlalchemy.ext.asyncio import AsyncEngine
    from sqlalchemy.orm import DeclarativeBase
    from starlette.background import BackgroundTask


logging.getLogger('aiosqlite').setLevel(logging.CRITICAL)

PAGES_TAG = 'Pages'
METADATA_TAG = 'Metadata'


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


class APIResponseClass(JSONResponse):
    """Used to wrap all API responses in a common JSON interface.

    See `core.schemas.APISchema`.
    """

    @override
    def __init__(
        self,
        content: Any,
        status_code: int = HTTPStatus.OK,
        headers: Mapping[str, str] | None = None,
        media_type: str | None = None,
        background: BackgroundTask | None = None,
    ) -> None:
        error_occurred: bool = status_code not in range(
            HTTPStatus.OK, HTTPStatus.MULTIPLE_CHOICES
        )
        super().__init__(
            APISchema(
                status_code=status_code,
                error=content if error_occurred else None,
                data=content if not error_occurred else None,
            ).model_dump(),
            status_code,
            headers,
            media_type,
            background,
        )

    @override
    def render(self, content: Any) -> bytes:
        return json.dumps(
            content,
            ensure_ascii=False,
            allow_nan=False,
            indent=None,
            separators=(',', ':'),
            default=(lambda dt: str(dt)),  # Serialize datetime objects
        ).encode('utf-8')


# TODO: include in routes
async def _get_app_version(request: Request) -> VersionSchema:
    """Return the current version of the app."""
    return VersionSchema(version=request.app.version)


async def _generic_error_handler(request: Request, e: Exception) -> APIResponseClass:
    error: ErrorSchema = ErrorSchema(type=type(e).__name__, message=str(e))

    # Handle exceptions that weren't explicitly caught
    if not isinstance(e, ClientError):
        logging.error(f'An unexpected "{error.type}" error occurred: {error.message}')
        return APIResponseClass(error, status_code=HTTPStatus.INTERNAL_SERVER_ERROR)

    # Determine the HTTP status code based on the exception type
    match e:
        case ModelLookupError():
            status_code = HTTPStatus.NOT_FOUND
        case _:
            status_code = HTTPStatus.CONFLICT

    logging.info(f'{error.message} (HTTP {status_code})')

    return APIResponseClass(error, status_code=status_code)


async def _validation_error_handler(
    request: Request, e: RequestValidationError
) -> APIResponseClass:
    error: ErrorSchema = ErrorSchema(type=type(e).__name__, message=(str(e)))
    logging.warning(f'Received invalid input: {str(e)}')
    return APIResponseClass(error, status_code=HTTPStatus.BAD_REQUEST)


def configure(app: FastAPI, *, prefix: str) -> None:
    """Do the required application setup.

    Args:
        app (FastAPI): the FastAPI app to configure.
        prefix (str): the default API path prefix.

    """
    # Install exception handlers
    error_handlers: dict[type[Exception], Callable[[Request, ...], Any]] = {
        Exception: _generic_error_handler,
        ClientError: _generic_error_handler,
        RequestValidationError: _validation_error_handler,
    }
    for e, handler in error_handlers.items():
        app.add_exception_handler(e, handler)

    # FIXME: this method call crashes the docs page
    # Install default API endpoints
    app.add_api_route(
        f'{prefix}/version',
        _get_app_version,
        tags=[METADATA_TAG],
        name='Get app version',
        description='Get the current app version',
    )


async def main(app: FastAPI) -> None:
    """Asynchronously serve the application on the desired host and port.

    Args:
        app (FastAPI): The FastAPI app to serve.

    Raises:
        KeyError: if a host or port is not included in the app extras.
        ValueError: if the port number provided is invalid.

    """
    host: str = app.extra['host']
    port: int = app.extra['port']

    max_port_num: Final[int] = 65535
    if 0 >= port > max_port_num:
        logging.critical('An invalid port number was provided for the host server')
        raise ValueError('Invalid port number')

    logging.info(f'Program started{" in debug mode" if app.debug else ""}')
    logging.debug(f'{app.extra=}')

    # Log the server's address
    ip: str = host
    if ip == '0.0.0.0':  # noqa: S104 - users may bind to all interfaces
        try:
            with socket(AF_INET, SOCK_DGRAM) as sock:
                sock.connect(('1.1.1.1', 80))
                ip = sock.getsockname()[0]
        except OSError:
            logging.warning('Unable to get default route')
            ip = '127.0.0.1'
    http_port: Final[int] = 80
    logging.info(
        f'Starting server at http://{ip}{f":{port}" if port != http_port else ""}'
    )

    # Run the server with the specified config
    await Server(
        Config(
            app,
            host=host,
            port=port,
            log_config=None,
            access_log=False,
            log_level='critical',
            server_header=False,
        )
    ).serve()
    logging.debug('Server stopped')


def shutdown() -> None:
    """Shutdown the server process. Allows the program to terminate."""
    os.kill(os.getpid(), signal.SIGTERM)
