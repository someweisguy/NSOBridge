"""Core NSO Bridge dependencies.

This file contains the core functions needed to run NSO Bridge.
"""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING, Final

from uvicorn import Config, Server

from .service import app

if TYPE_CHECKING:
    from fastapi import APIRouter

logging.basicConfig(
    format='{levelname}: {message}',
    datefmt='%m/%d/%Y %H:%M:%S',
    style='{',
    level=logging.INFO,
)


def load_api(router: APIRouter) -> None:
    """Load an API router into the core application.

    Args:
        router (APIRouter): A FastAPI router with endpoints to attach to the
        application.

    """
    API_PREFIX: Final[str] = '/api'
    app.include_router(router, prefix=API_PREFIX)


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
