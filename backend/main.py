#!/usr/bin/env python3
"""The injection point of the program."""

from __future__ import annotations

import asyncio
import logging
import sys
from datetime import datetime
from logging import Handler, StreamHandler
from pathlib import Path
from typing import TYPE_CHECKING, Final, LiteralString

import colorlog
import core
import game
import update
import user
import ws
from cli import args
from core import APIResponseClass, DatabaseEngine, EngineFactory
from fastapi import FastAPI
from fastapi.concurrency import asynccontextmanager
from game import Roster, Series, wftda_2025
from sqlalchemy import Result, Select, select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
from websockets import CloseCode

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import async_sessionmaker
    from sqlalchemy.ext.asyncio.session import AsyncSession
    from update import GithubReleaseSchema


LOG_DIR_NAME: str = './logs'
API_PREFIX: str = '/api'


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle the app setup and teardown.

    Args:
        app (FastAPI): the app to setup and teardown.

    """
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
            logging.critical(f'database path name is invalid ({db_pathname=})')
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

    logging.debug('Yielding the application runtime')
    yield

    logging.info('Disconnecting all WebSockets')
    await ws.disconnect_all(CloseCode.GOING_AWAY, 'The server is shutting down')
    logging.debug('WebSockets disconnected')


# Initialize the application and set the appropriate routes
app: Final[FastAPI] = FastAPI(
    debug=args.debug,
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
    host=args.host,
    port=args.port,
    db_pathname=args.db_pathname,
)


if __name__ == '__main__':

    def _get_log_format(*, use_colors: bool = False) -> str:
        time: LiteralString = '%(asctime)s'
        level: LiteralString = '%(levelname)s'
        if use_colors:
            time = f'%(light_black)s{time}%(reset)s'
            level = f'%(bold)s%(log_color)s{level}%(reset)s'
        return f'{time} {level} %(message)s'

    # Configure logging
    datefmt: Final[str] = '%H:%M:%S'
    log_dir: Final[Path] = Path(LOG_DIR_NAME)
    if not log_dir.exists():
        log_dir.mkdir()
    file: Path = log_dir / Path(f'{datetime.now().strftime("%Y-%m-%d")}.log')
    logging_handlers: list[Handler] = [logging.FileHandler(file, mode='a')]
    if not args.silent:
        console_logger: StreamHandler = logging.StreamHandler(sys.stdout)
        console_logger.formatter = colorlog.ColoredFormatter(
            fmt=_get_log_format(use_colors=True),
            datefmt=datefmt,
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
        level=logging.DEBUG if app.debug else logging.INFO,
        format=_get_log_format(use_colors=False),
        datefmt=datefmt,
        handlers=logging_handlers,
    )

    # Check for new releases in the Github releases page
    if args.check_for_updates:
        logging.info('Checking for application updates')
        try:
            releases: list[GithubReleaseSchema] = update.check_for_updates()
            latest: GithubReleaseSchema = releases[-1]
            logging.debug(f'Found latest release tagged "{latest.tag_name}"')
            logging.debug(f'Current version is "{app.version}"')
        except ConnectionError:
            logging.warning('Unable to check for updates at this time')
    else:
        logging.info('Skipping update check')

    # Run the application
    try:
        asyncio.run(core.run(app), loop_factory=asyncio.new_event_loop)
    except KeyboardInterrupt:
        logging.info('Server stopped due to keyboard interrupt')
    finally:
        logging.info('Program terminated')
        logging.shutdown()
        core.shutdown()
