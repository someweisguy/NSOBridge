#!/usr/bin/env python3
"""The injection point of the program."""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING, Final

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
from sqlalchemy import Result, Select, select
from websockets import CloseCode

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
    from update import GithubReleaseSchema


LOG_DIR_NAME: str = './logs'
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
    app.include_router(core.pages_router)
    for router in [core.api_router, *game.routers, *user.routers]:
        app.include_router(router, prefix=API_PREFIX)
    app.mount('/assets', core.assets)
    app.mount('/ws', ws.app)

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
    logging.debug('App runtime has yielded to shutdown handler')

    logging.info('Disconnecting all WebSockets')
    await ws.disconnect_all(CloseCode.GOING_AWAY, 'The server is shutting down')
    logging.debug('WebSockets disconnected')


app: Final[FastAPI] = FastAPI(
    db_pathname='',  # Require default empty string
    default_response_class=APIResponseClass,
    lifespan=lifespan,
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
)


if __name__ == '__main__':
    from signal import SIGTERM
    from threading import Thread

    import cli
    from uvicorn import Server

    if TYPE_CHECKING:
        from uvicorn import Server

    # Import the command line arguments
    app.debug: bool = cli.args.debug
    app.extra['db_pathname'] = cli.args.db_pathname
    app.extra['host'] = cli.args.host
    app.extra['port'] = cli.args.port

    # Configure logging
    silent_logging: bool = cli.args.silent
    log_level: int = logging.DEBUG if app.debug else logging.INFO
    core.configure_logging(LOG_DIR_NAME, level=log_level, silent=silent_logging)

    # Check for new releases in the Github releases page
    if cli.args.check_for_releases:
        logging.info('Checking for new releases')
        try:
            releases: list[GithubReleaseSchema] = update.check_for_releases()
            latest: GithubReleaseSchema = releases[-1]
            logging.debug(f'Found latest release tagged "{latest.tag_name}"')
            logging.debug(f'Current version is "{app.version}"')
        except ConnectionError:
            logging.warning('Unable to check for releases at this time')
    else:
        logging.info('Skipping release check')

    # Build a server and run it in a new thread
    uvicorn: Server = core.get_server(app)
    uvicorn_thread: Thread = Thread(name='uvicorn', target=uvicorn.run)
    uvicorn_thread.start()

    # Run the application
    try:
        gui.run(app)  # Blocks program execution
        logging.info('The GUI has been closed')
    except KeyboardInterrupt:
        logging.info('Handling keyboard interrupt')
    finally:
        logging.debug('Sending terminate signal to Uvicorn server')
        uvicorn.handle_exit(SIGTERM, None)
        uvicorn_thread.join()

        logging.info('Program terminated')
        logging.shutdown()
        core.shutdown()
