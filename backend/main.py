#!/usr/bin/env python3
"""The injection point of the program."""

import asyncio
import logging
import os
import sys
from datetime import datetime
from logging import Handler, StreamHandler
from pathlib import Path
from socket import AF_INET, SOCK_DGRAM, socket
from typing import TYPE_CHECKING, Final

import colorlog
import core
import game
import user
import ws
from core import BaseSQLModel, DatabaseEngine
from game import Roster, Series, wftda_2025
from sqlalchemy import Result, Select, select
from websockets import CloseCode

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import async_sessionmaker

HOST: Final[str] = os.environ['UVICORN_HOST']
PORT: Final[int] = int(os.environ['UVICORN_PORT'])
LOG_LEVEL: Final[int | None] = logging.DEBUG
LOG_DATE_FMT: Final[str] = '%H:%M:%S'


def get_log_format(*, use_colors: bool = False) -> str:
    """Get a log format string with or without colors."""
    level = '%(levelname)s'
    if use_colors:
        level = f'%(log_color)s{level}%(reset)s'
    return f'%(asctime)s {level} %(message)s'


async def main(  # noqa: PLR0913 PLR0915 - main method may have many arguments
    interface: tuple[str, int],
    *,
    db_path_name: str = '',
    silent: bool = False,
    log_level: int | str | None = logging.INFO,
    log_dir_name: str = './logs',
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
        silent (bool, optional): False to log to console
        log_level (int | str | None, optional): the log level at which to run the
        application. Defaults to 'logging.INFO'.
        log_dir_name (str, optional): the directory in which to store logs. Defaults to
        './logs'.
        debug (bool, optional): True to enable debug mode. Defaults to False.

    """
    # Configure logging
    log_dir: Final[Path] = Path(log_dir_name)
    if not log_dir.exists():
        log_dir.mkdir()
    file: Path = log_dir / Path(f'{datetime.now().strftime("%Y-%m-%d")}.log')
    logging_handlers: list[Handler] = [logging.FileHandler(file, mode='a')]
    if not silent:
        console_logger: StreamHandler = logging.StreamHandler(sys.stdout)
        console_logger.formatter = colorlog.ColoredFormatter(
            fmt=get_log_format(use_colors=True),
            datefmt=LOG_DATE_FMT,
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
        datefmt=LOG_DATE_FMT,
        handlers=logging_handlers,
    )
    logging.info(f'Program started{" in debug mode" if debug else ""}')
    logging.debug(f'args: {interface=} {db_path_name=} {silent=} {debug=}')

    # Connect to the desired database
    db_path_name = db_path_name.strip()
    if not db_path_name:
        logging.warning('Connecting to in-memory database')
    else:
        logging.info(f'Connecting to Database: {db_path_name}')
    try:
        core.db = DatabaseEngine(BaseSQLModel, db_path_name)
    except ValueError:
        logging.critical(f'database path name is invalid ({db_path_name=})')
        return
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
    asyncio.run(main((HOST, PORT), log_level=LOG_LEVEL, debug=True))
