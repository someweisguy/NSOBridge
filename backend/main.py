#!/usr/bin/env python3
"""The injection point of the program."""

import asyncio
import logging
import os
import sys
from datetime import datetime
from logging import Handler
from socket import AF_INET, SOCK_DGRAM, socket
from typing import TYPE_CHECKING, Final

import core
import game
import user
import ws
from game import Roster, Series, wftda_2025
from sqlalchemy import Result, Select, select
from websockets import CloseCode

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import async_sessionmaker


async def main(host_port: tuple[str, int], *, debug: bool = False) -> None:
    """Begin the program.

    Handles the configuration of the database, the API, the GUI, and then serves the
    app.

    Args:
        host_port (tuple[str, int]): the host IP address and port on which to serve the
        application, as a tuple (host, port).
        debug (bool): True to enable logging to console.

    """
    # Configure logging
    file_name: str = f'{datetime.now().strftime("%Y-%m-%d")}.log'
    logging_handlers: list[Handler] = [logging.FileHandler(file_name, mode='a')]
    if debug:
        logging_handlers.append(logging.StreamHandler(sys.stdout))
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s %(levelname)s (%(filename)s:%(lineno)d) %(message)s',
        datefmt='%H:%M:%S',
        handlers=logging_handlers,
    )
    if debug:
        logging.debug('Starting application in debug mode')

    logging.info(f'Connecting to Database in: {core.db.path}')
    await core.db.create_all()

    # Create a Bout model if one does not already exist
    logging.debug('Checking for initial data')
    session_factory: async_sessionmaker = core.db.get_async_session_factory()
    async with session_factory() as session, session.begin():
        statement: Select[tuple[wftda_2025.Bout]] = select(wftda_2025.Bout)
        results: Result[tuple[wftda_2025.Bout]] = await session.execute(statement)
        if results.scalar_one_or_none() is None:
            logging.info('Creating initial Bout model')
            bout = wftda_2025.Bout(
                Series(),
                Roster('Home', 'Default League'),
                Roster('Away', 'Default League'),
            )
            session.add(bout)
        await session.commit()
    logging.debug('Initial data created')

    # Load the server API and the WebSocket application
    logging.debug('Mounting application API')
    core.app.mount('/ws', ws.app)
    for router in [*game.routers, user.router]:
        core.app.include_router(router, prefix='/api')

    # Log the server's address and serve the application
    host, port = host_port
    ip: str = host
    if ip == '0.0.0.0':  # noqa: S104
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
    await core.run(host, port)
    logging.debug('Application stopped')

    logging.info('Disconnecting all WebSockets')
    await ws.disconnect_all(CloseCode.GOING_AWAY, 'The server is shutting down')
    logging.debug('WebSockets disconnected')


if __name__ == '__main__':
    HOST: Final[str] = os.environ['UVICORN_HOST']
    PORT: Final[int] = int(os.environ['UVICORN_PORT'])

    asyncio.run(main((HOST, PORT), debug=True))
