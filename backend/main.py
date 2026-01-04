#!/usr/bin/env python3
"""The injection point of the program."""

from __future__ import annotations

import asyncio
import logging
from argparse import ArgumentParser, Namespace
from typing import TYPE_CHECKING, Final

import core
import game
import update
import user
import ws
from core import DatabaseEngine, EngineFactory
from fastapi import FastAPI
from fastapi.concurrency import asynccontextmanager
from game import Roster, Series, wftda_2025
from sqlalchemy import Result, Select, select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
from update import GithubReleaseSchema
from websockets import CloseCode

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import async_sessionmaker
    from sqlalchemy.ext.asyncio.session import AsyncSession


LOG_DIR_NAME: str = './logs'
API_PREFIX: str = '/api'


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle the app setup and teardown.

    Args:
        app (FastAPI): the app to setup and teardown.

    """
    core.do_app_setup(app, prefix=API_PREFIX)

    # Load the server API and the WebSocket application
    logging.debug('Mounting application API')
    app.mount('/ws', ws.app)
    for router in [*game.routers, user.router]:
        app.include_router(router, prefix=API_PREFIX)

    # Connect to the desired database
    db: DatabaseEngine = EngineFactory.get_default_engine()
    db_path_name: str | None = app.extra.get('db_path_name', None)
    if db_path_name is None:
        logging.error('No database pathname was found')
        db_path_name = ''
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

    yield  # Yield the application runtime

    logging.info('Disconnecting all WebSockets')
    await ws.disconnect_all(CloseCode.GOING_AWAY, 'The server is shutting down')
    logging.debug('WebSockets disconnected')


async def main(app: FastAPI, check_for_updates: bool, silent: bool) -> None:
    """Begin the program.

    Handles the configuration of the database, the API, the GUI, and then serves the
    app.

    Args:
        app (FastAPI): the FastAPI app to serve.
        check_for_updates (bool): True to check for updates.
        silent (bool): True to disable logging to the terminal

    """
    core.configure_logging(
        log_dir_name=LOG_DIR_NAME,
        log_level=logging.DEBUG if app.debug else logging.INFO,
        silent=silent,
    )
    logging.info(f'Program started{" in debug mode" if app.debug else ""}')
    logging.debug(f'args: {app.extra=}')

    if check_for_updates:
        try:
            logging.info('Checking for application updates')
            releases: list[GithubReleaseSchema] = update.check_for_updates()
            latest: GithubReleaseSchema = releases[-1]
            logging.debug(f'Found latest release tagged "{latest.tag_name}"')
            logging.debug(f'Current version is "{app.version}"')
        except ConnectionError:
            logging.warning('Unable to check for updates at this time')
    else:
        logging.info('Skipping update check')

    await core.run(app)
    logging.debug('Server stopped')

    logging.info('Program terminated')
    logging.shutdown()


parser: ArgumentParser = ArgumentParser(
    prog='NSO Bridge',
    description='A scoreboard app designed for the WFTDA roller derby ruleset.',
)
parser.add_argument(
    'host',
    type=str,
    help='The interface on which to serve the app',
)
parser.add_argument(
    '-p',
    type=int,
    help='The port on which to serve the app (Defaults to 8000)',
    default=8000,
    dest='port',
)
parser.add_argument(
    '-f',
    type=str,
    help='The database file to use for storing game data. If no file is provided, '
    'an in-memory database will be used',
    default='',
    dest='db_pathname',
)
parser.add_argument(
    '-d',
    '--debug',
    help='Enable debug logging',
    action='store_true',
    dest='debug',
)
parser.add_argument(
    '-s',
    '--silent',
    help='Disables log messages to the console',
    action='store_true',
    dest='silent',
)
parser.add_argument(
    '-U',
    help='Disables checking for updates on app startup',
    action='store_false',
    dest='check_for_updates',
)
args: Namespace = parser.parse_args()

# Initialize the application and set the appropriate routes
app: Final[FastAPI] = FastAPI(
    debug=args.debug,
    default_response_class=core.APIResponseClass,
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
    host=args.host,
    port=args.port,
    db_pathname=args.db_pathname,
)


if __name__ == '__main__':
    try:
        asyncio.run(
            main(app, args.check_for_updates, args.silent),
            loop_factory=asyncio.new_event_loop,
        )
    except KeyboardInterrupt:
        core.shutdown()
