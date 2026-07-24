"""FastAPI error handlers and core service methods."""

from __future__ import annotations

import logging
import os
import signal
from socket import AF_INET, SOCK_DGRAM, socket
from typing import TYPE_CHECKING, Final

from uvicorn import Config, Server

if TYPE_CHECKING:
    from fastapi import FastAPI


logging.getLogger('aiosqlite').setLevel(logging.CRITICAL)


def get_server(app: FastAPI, host: str = '0.0.0.0', port: int = 8000) -> Server:
    """Build and return a Uvicorn server to serve the desired FastAPI app.

    Args:
        app (FastAPI): The FastAPI app to serve.
        host (str, optional): The host interface on which to serve the app. Defaults to
        '0.0.0.0'.
        port (int, optional): The host port on which to serve the app. Defaults to 8000.

    Raises:
        KeyError: if a host or port is not included in the app extras.
        ValueError: if the port number provided is invalid.

    Returns:
        Server: the configured server which can be used to serve the app.

    """
    max_port_num: Final[int] = 65535
    if 0 >= port > max_port_num:
        logging.critical(
            f'An invalid port number was provided for the host server ({port=})'
        )
        raise ValueError('Invalid port number')

    # Log the server's address
    ip: str = host
    if ip == '0.0.0.0':
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
    to run on all interfaces (0.0.0.0).

    This method doesn't actually transmit any data.

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
