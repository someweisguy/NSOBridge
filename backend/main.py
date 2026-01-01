#!/usr/bin/env python3
"""The injection point of the program."""

import asyncio
import logging
import os
from socket import AF_INET, SOCK_DGRAM, socket
from typing import TYPE_CHECKING, Final

import core
import game
import user
import ws
from core import DatabaseEngine, EngineFactory
from game import Roster, Series, wftda_2025
from sqlalchemy import Result, Select, select
from websockets import CloseCode

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import async_sessionmaker
    from sqlalchemy.ext.asyncio.session import AsyncSession

HOST: str = os.environ['UVICORN_HOST']
PORT: int = int(os.environ['UVICORN_PORT'])
LOG_LEVEL: int | None = logging.DEBUG
LOG_DIR_NAME: str = './logs'
DB_PATH_NAME: str = ''
SILENT: bool = False


async def main(  # noqa: PLR0915 - main method may have many arguments
    interface: tuple[str, int],
    *,
    db_path_name: str = '',
    debug: bool = False,
) -> None:
    """Begin the program.

    Handles the configuration of the database, the API, the GUI, and then serves the
    app.

    Args:
        interface (tuple[str, int]): the host IP address and port on which to serve the
        application, as a tuple (host, port).
        db_path_name: (str, optional): the path of the database to use. Uses an
        in-memory database if no path name is provided. Defaults to ''.
        debug (bool, optional): True to enable debug mode. Defaults to False.

    """
    core.configure_logging(
        log_dir_name=LOG_DIR_NAME, log_level=LOG_LEVEL, silent=SILENT
    )
    logging.info(f'Program started{" in debug mode" if debug else ""}')
    logging.debug(f'args: {interface=} {db_path_name=} {debug=}')

    # Connect to the desired database
    db_path_name = db_path_name.strip()
    db: DatabaseEngine = EngineFactory.get_default_engine()
    if not db_path_name:
        logging.warning('Connecting to in-memory database')
    else:
        logging.info(f'Connecting to Database: {db_path_name}')
        try:
            db = EngineFactory.create_engine(db_path_name)
            EngineFactory.set_default_engine(db)
        except ValueError:
            logging.critical(f'database path name is invalid ({db_path_name=})')
            return
    await db.create_all()

    # Create a Bout model if one does not already exist
    logging.debug('Checking for initial data')
    session_factory: async_sessionmaker[AsyncSession] = db.get_async_session_factory()
    async with session_factory() as session:
        statement: Select[tuple[wftda_2025.Bout]] = select(wftda_2025.Bout)
        results: Result[tuple[wftda_2025.Bout]] = await session.execute(statement)
        if results.scalar_one_or_none() is None:
            logging.info('Creating initial Bout model')
            series: Series = Series()
            series.bouts.append(
                wftda_2025.Bout(
                    Roster('Home', 'Default League'),
                    Roster('Away', 'Default League'),
                )
            )
            session.add(series)
            logging.debug('Initial data created')
            await session.commit()
        else:
            logging.debug('Initial data found')

    # Load the server API and the WebSocket application
    logging.debug('Mounting application API')
    core.app.mount('/ws', ws.app)
    for router in [*game.routers, user.router]:
        core.app.include_router(router, prefix='/api')

    # Log the server's address and serve the application
    host, port = interface
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
    await core.run(host, port)
    logging.debug('Application stopped')

    logging.info('Disconnecting all WebSockets')
    await ws.disconnect_all(CloseCode.GOING_AWAY, 'The server is shutting down')
    logging.debug('WebSockets disconnected')
    logging.info('Program terminated')
    logging.shutdown()


if __name__ == '__main__':
    asyncio.run(main((HOST, PORT), db_path_name=DB_PATH_NAME, debug=True))
