"""Core services including database engine management."""

from __future__ import annotations

import logging
import os
import signal
from http import HTTPStatus
from socket import AF_INET, SOCK_DGRAM, socket
from typing import TYPE_CHECKING, Any, Callable, Final

from fastapi.exceptions import RequestValidationError
from uvicorn import Config, Server

from .exceptions import ClientError, ModelLookupError
from .schemas import APIResponseClass, ErrorSchema

if TYPE_CHECKING:
    from fastapi import FastAPI, Request


logging.getLogger('aiosqlite').setLevel(logging.CRITICAL)


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


error_handlers: Final[dict[type[Exception], Callable[[Request, ...], Any]]] = {
    Exception: _generic_error_handler,
    ClientError: _generic_error_handler,
    RequestValidationError: _validation_error_handler,
}


def get_server(app: FastAPI) -> Server:
    """Build and return a Uvicorn server to serve the desired FastAPI app.

    Args:
        app (FastAPI): The FastAPI app to serve.

    Raises:
        KeyError: if a host or port is not included in the app extras.
        ValueError: if the port number provided is invalid.

    Returns:
        Server: the configured server which can be used to serve the app.

    """
    host: str = app.extra['host']
    port: int = app.extra['port']

    max_port_num: Final[int] = 65535
    if 0 >= port > max_port_num:
        logging.critical(
            f'An invalid port number was provided for the host server ({port=})'
        )
        raise ValueError('Invalid port number')

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
        f'Configuring Uvicorn to serve app at '
        f'http://{ip}{f":{port}" if port != http_port else ""}'
    )

    # Run the server with the specified config
    return Server(
        Config(
            app,
            host=host,
            port=port,
            log_config=None,
            access_log=False,
            log_level='critical',
            server_header=False,
        )
    )


def shutdown() -> None:
    """Shutdown the server process. Allows the program to terminate."""
    os.kill(os.getpid(), signal.SIGTERM)
