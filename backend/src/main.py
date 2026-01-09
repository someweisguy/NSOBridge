#!/usr/bin/env python3
"""The injection point of the program."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import TYPE_CHECKING, Final

import core
import game
import gui
import user
import ws
from core import APIResponseClass, DatabaseEngine, EngineFactory
from fastapi import FastAPI
from fastapi.concurrency import asynccontextmanager
from game import Roster, Series, wftda_2025
from semver import VersionInfo
from sqlalchemy import Result, Select, select
from websockets import CloseCode

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker


CONFIG_PATHNAME: Final[Path] = Path.cwd() / 'backend' / 'config.ini'
APP_VERSION_INFO: Final[VersionInfo] = VersionInfo(0, 1, 0)
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
    summary='A scoreboard and stats application for roller derby.',
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
    from configparser import ConfigParser

    # Parse the backend arguments from the config file
    section: Final[str] = 'backend'
    config = ConfigParser()
    if not CONFIG_PATHNAME.exists():
        config.read_dict(
            {
                section: {
                    'debug': False,
                    'db_pathname': 'data.db',
                    'host': '0.0.0.0',
                    'port': 8000,
                    'auto_hide': False,
                }
            }
        )
        with open(CONFIG_PATHNAME, 'w') as file:
            config.write(file)
    else:
        with open(CONFIG_PATHNAME, 'r') as file:
            config.read_file(file)
    truth_values: set[str] = {'true', 'yes'}
    app.extra['db_pathname'] = config.get(section, 'db_pathname', fallback='')
    app.extra['host'] = config.get(section, 'host', fallback='0.0.0.0')
    app.extra['port'] = int(config.get(section, 'port', fallback=8000))
    app.debug: bool = config.get(section, 'debug', fallback='').lower() in truth_values
    auto_hide: bool = (
        config.get(section, 'auto_hide', fallback='').lower() in truth_values
    )

    # Configure logging
    log_level: int = logging.DEBUG if app.debug else logging.INFO
    core.configure_logging(LOG_DIR_NAME, level=log_level, silent=False)

    # Run the application
    try:
        gui.run(app, auto_hide=auto_hide)  # Blocks program execution
    except KeyboardInterrupt:
        logging.info('Handling keyboard interrupt')
    finally:
        logging.info('Program terminated')
        logging.shutdown()
        core.shutdown()
