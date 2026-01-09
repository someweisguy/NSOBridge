"""FastAPI error handlers and core service methods."""

from __future__ import annotations

import logging
import os
import signal
import sys
from datetime import datetime
from http import HTTPStatus
from logging import Handler, StreamHandler
from pathlib import Path
from socket import AF_INET, SOCK_DGRAM, socket
from typing import TYPE_CHECKING, Any, Callable, Final, LiteralString

import colorlog
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


def configure_logging(
    log_dir: Path | str, *, level: int | str | None, silent: bool
) -> None:
    """Configure logging for the application.

    Args:
        log_dir (Path | str): the directory in which to write log files.
        level (int | str | None): the logging level to use.
        silent (bool): False to disable logging to the console.

    """

    def _get_log_format(*, use_colors: bool = False) -> str:
        time: LiteralString = '%(asctime)s'
        level: LiteralString = '%(levelname)s'
        if use_colors:
            time = f'%(light_black)s{time}%(reset)s'
            level = f'%(bold)s%(log_color)s{level}%(reset)s'
        return f'{time} {level} %(message)s'

    datefmt: LiteralString = '%H:%M:%S'
    if not isinstance(log_dir, Path):
        log_dir = Path(log_dir)
    if not log_dir.exists():
        log_dir.mkdir()
    file: Path = log_dir / Path(f'{datetime.now().strftime("%Y-%m-%d")}.log')
    logging_handlers: list[Handler] = [logging.FileHandler(file, mode='a')]
    if not silent:
        console_logger: StreamHandler = logging.StreamHandler(sys.stdout)
        console_logger.formatter = colorlog.ColoredFormatter(
            fmt=_get_log_format(use_colors=True),
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
        level=level,
        format=_get_log_format(use_colors=False),
        datefmt=datefmt,
        handlers=logging_handlers,
    )


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
        ip = get_default_route()
    http_port: Final[int] = 80
    logging.info(
        f'Configuring Uvicorn service for '
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


def get_default_route() -> str:
    """Get the default route of this device.

    This is the IP address that this server would serve on if the user allows the server
    to run on all interfaces (0.0.0.0). This method doesn't actually transmit any data.
    This is a known

    Returns:
        str: the default route of this device.

    """
    try:
        with socket(AF_INET, SOCK_DGRAM) as sock:
            sock.connect(('1.1.1.1', 80))
            ip: str = sock.getsockname()[0]
    except OSError:
        ip = 'localhost'
    return ip


def shutdown() -> None:
    """Shutdown the server process. Allows the program to terminate."""
    os.kill(os.getpid(), signal.SIGTERM)
