"""Command-line arguments for the application."""

import asyncio
import logging
from argparse import ArgumentParser, Namespace
from pathlib import Path
from typing import TYPE_CHECKING, Final, Iterable

import core
import game
import gui
import update
import user
import ws
from core import APIResponseClass, DatabaseEngine, EngineFactory
from fastapi import FastAPI
from fastapi.concurrency import asynccontextmanager
from game import Roster, Series, wftda_2025
from semver import VersionInfo
from sqlalchemy import Result, Select, select
from update import GithubReleaseSchema
from uvicorn import Server
from websockets import CloseCode

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker


APP_VERSION_INFO: Final[VersionInfo] = VersionInfo(0, 1, 1)
CONFIG_FILE_NAME: Path = core.get_resource_path('./config.ini')
LOG_DIR_NAME: Path = core.get_resource_path('./logs')
API_PREFIX: str = '/api'


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle the app setup and teardown.

    Args:
        app (FastAPI): the app to setup and teardown.

    """
    logging.info(f'App started{" in debug mode" if app.debug else ""}')
    logging.debug(f'{app.extra=}')

    # Load the API and exception handlers
    for e, handler in core.error_handlers.items():
        app.add_exception_handler(e, handler)
    for router in [core.api_router, *game.routers, *user.routers]:
        app.include_router(router, prefix=API_PREFIX)
    app.mount('/assets', core.assets)
    app.mount('/ws', ws.app)

    # Load the pages router without a path prefix
    app.include_router(core.pages_router)

    # Connect to the desired database
    db: DatabaseEngine = EngineFactory.get_default_engine()
    db_pathname: str | None = app.extra.get('db_pathname', None)
    if db_pathname is None:
        logging.error('No database pathname was found')
        db_pathname = ''
    if not db_pathname:
        logging.warning('Connecting to in-memory database')
    else:
        logging.info(f'Connecting to database: {db_pathname}')
        try:
            db = EngineFactory.create_engine(db_pathname)
            EngineFactory.set_default_engine(db)
        except ValueError:
            logging.critical('Database pathname is invalid')
            return
    logging.debug('Creating database schema')
    await db.create_all()

    # Create a Bout model if one does not already exist
    logging.debug('Checking database for model data')
    session_factory: async_sessionmaker[AsyncSession] = db.get_async_session_factory()
    async with session_factory() as session:
        statement: Select[tuple[wftda_2025.Bout]] = select(wftda_2025.Bout)
        results: Result[tuple[wftda_2025.Bout]] = await session.execute(statement)
        if results.scalar_one_or_none() is None:
            logging.info('Instantiating the initial Bout model')
            series: Series = Series()
            series.bouts.append(
                wftda_2025.Bout(
                    Roster('Home', 'Default League'),
                    Roster('Away', 'Default League'),
                )
            )
            session.add(series)
            await session.commit()
            logging.debug('The Bout model was inserted into the database')
        else:
            logging.debug('Model data was found in the database')

    logging.debug('Yielding the app runtime')
    yield
    logging.debug('App lifespan has resumed execution')

    logging.info('Disconnecting all WebSockets')
    await ws.disconnect_all(CloseCode.GOING_AWAY, 'The server is shutting down')
    logging.debug('WebSockets disconnected')


app: Final[FastAPI] = FastAPI(
    db_pathname='',  # Require default empty string
    default_response_class=APIResponseClass,
    lifespan=lifespan,
    title='NSO Bridge',
    summary='A scoreboard and statistics server for roller derby.',
    description="""
    
    """,
    version=str(APP_VERSION_INFO),
    license_info={
        'name': 'MIT License',
        'identifier': 'MIT',
    },
    docs_url='/docs',
)


if __name__ == '__main__':
    parser: ArgumentParser = ArgumentParser(
        prog=app.title,
        description=app.summary,
        epilog=app.description,
    )
    parser.add_argument(
        'host',
        type=str,
        help='The interface on which to serve the app. "0.0.0.0" serves the app on all '
        'interfaces',
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
        help='Disables checking for new releases on app startup',
        action='store_false',
        dest='check_for_releases',
    )
    parser.add_argument(
        '-G',
        help='Runs the app with a GUI',
        action='store_true',
        dest='use_gui',
    )

    args: Final[Namespace] = parser.parse_args()

    # Import the command line arguments
    app.debug: bool = args.debug
    app.extra['db_pathname'] = args.db_pathname
    app.extra['host'] = args.host
    app.extra['port'] = args.port

    # Configure logging
    silent_logging: bool = args.silent
    log_level: int = logging.DEBUG if app.debug else logging.INFO
    core.configure_logging(LOG_DIR_NAME, level=log_level, silent=silent_logging)

    # Check for new releases in the Github releases page
    if args.check_for_releases:
        logging.info('Checking for new releases')
        try:
            data: Iterable = update.fetch_release_data()
            release: GithubReleaseSchema = update.parse_latest_release(data)

            latest_version: VersionInfo = VersionInfo.parse(release.tag_name)
            current_version: VersionInfo = VersionInfo.parse(app.version)
            logging.debug(f'Found latest release tagged "{release.tag_name}"')
            logging.debug(f'Current version is "{app.version}"')
            if current_version < latest_version:
                logging.info(
                    f'A new version is available! Download it at {release.html_url}'
                )
        except (ConnectionError, ValueError):
            logging.warning('Unable to check for releases at this time')
    else:
        logging.info('Skipping release check')

    # Run the application
    try:
        if args.use_gui:
            gui.run(app, auto_hide=False)
        else:
            server: Server = core.get_server(app)
            asyncio.run(server.serve())
    except KeyboardInterrupt:
        logging.info('Handling keyboard interrupt')
    finally:
        logging.info('Program terminated')
        logging.shutdown()
        core.shutdown()
