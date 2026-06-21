"""Command-line arguments for the application."""

import asyncio
import logging
from argparse import ArgumentParser, Namespace
from pathlib import Path
from typing import Final, Iterable

import core.app
import core.server
import core.updates
import core.users
import core.ws
import game
import rules
from core.app import endpoint_profiling_middleware
from core.db import create_tables, get_database_url, session_factory
from core.responses import APIResponse
from core.updates import GithubReleaseSchema
from fastapi import FastAPI
from fastapi.concurrency import asynccontextmanager
from game import Series, create_bout
from semver import VersionInfo
from sqlalchemy import Result, Select, select
from sqlalchemy.engine.url import URL
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine
from uvicorn import Server
from websockets import CloseCode

APP_VERSION_INFO: Final[VersionInfo] = VersionInfo(0, 2, 3)
CONFIG_FILE_NAME: Path = core.app.get_resource_path('./config.ini')
LOG_DIR_NAME: Path = core.app.get_resource_path('./logs')
API_PREFIX: str = '/api'

DEFAULT_BOUT_RULESET_NAME = 'WFTDA 2025'


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle the app setup and teardown.

    Args:
        app (FastAPI): the app to setup and teardown.

    """
    logging.info(f'App started{" in debug mode" if app.debug else ""}')

    # Load the API and exception handlers
    for e, handler in core.app.error_handlers.items():
        app.add_exception_handler(e, handler)
    for router in [
        core.app.api_router,
        *core.users.routers,
        *game.routers,
        rules.router,
    ]:
        app.include_router(router, prefix=API_PREFIX)
    app.mount('/assets', core.app.assets)
    app.mount('/ws', core.ws.app)

    # Load the pages router without a path prefix
    app.include_router(core.app.pages_router)

    # Create a Bout model if one does not already exist
    logging.debug('Checking database for model data')
    async with session_factory() as session:
        try:
            statement: Select[tuple[Series]] = select(Series)
            results: Result[tuple[Series]] = await session.execute(statement)
        except Exception as e:
            logging.critical(e)
            raise e
        if len(results.scalars().all()) == 0:
            logging.info('Instantiating the initial Series model')
            try:
                series: Series = Series('Default Series')
                session.add(series)
                await session.commit()

                # Create the initial Bout using the API and requery it
                await session.refresh(series)
                await create_bout(
                    session, series, DEFAULT_BOUT_RULESET_NAME, ['Home', 'Away']
                )
            except Exception as e:
                logging.critical(e)
                raise e
            try:
                await session.commit()
            except Exception as e:
                logging.critical(e)
                raise e
            logging.debug('Initial data was inserted into the database')
        else:
            logging.debug('Model data was found in the database')

    logging.debug('Yielding the app runtime')
    yield
    logging.debug('App lifespan has resumed execution')

    logging.info('Disconnecting all WebSockets')
    await core.ws.disconnect_all(CloseCode.GOING_AWAY, 'The server is shutting down')
    logging.debug('WebSockets disconnected')


app: Final[FastAPI] = FastAPI(
    default_response_class=APIResponse,
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
    import gui

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
        type=str.lstrip,
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

    # Import the command line arguments
    args: Final[Namespace] = parser.parse_args()
    app.debug = args.debug

    # Configure logging
    log_level: int = logging.DEBUG if args.debug else logging.INFO
    core.configure_logging(LOG_DIR_NAME, level=log_level, silent=args.silent)

    # Check for new releases in the Github releases page
    if args.check_for_releases:
        logging.info('Checking for new releases')
        try:
            data: Iterable = core.updates.fetch_release_data()
            release: GithubReleaseSchema = core.updates.parse_latest_release(data)

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

    # Configure debugging
    if args.debug:
        # Add a debug endpoint profile middleware - looks funky but it works!
        app.middleware('http')(endpoint_profiling_middleware)

    # Run the application
    try:
        if args.use_gui:
            gui.run(app, args.db_pathname, args.host, args.port, auto_hide=False)
        else:
            # Connect to the database
            if not args.db_pathname:
                logging.warning('Connecting to in-memory database')
            else:
                logging.info(f'Connecting to database: {args.db_pathname}')
                try:
                    url: URL = get_database_url(args.db_pathname)
                    async_engine: AsyncEngine = create_async_engine(url)
                    asyncio.run(create_tables(async_engine))
                    session_factory.configure(bind=async_engine)
                except ValueError as e:
                    logging.critical('Database pathname is invalid')
                    raise e
                except Exception as e:
                    logging.critical(e)
                    raise e

            server: Server = core.server.get_server(app, args.host, args.port)
            asyncio.run(server.serve())
            logging.debug('Asyncio loop has closed')
    except KeyboardInterrupt:
        logging.info('Handling keyboard interrupt')
    finally:
        logging.info('Program terminated')
        logging.shutdown()
        core.server.shutdown()
