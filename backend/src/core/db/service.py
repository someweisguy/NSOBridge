"""Handling of client and server caching."""

from __future__ import annotations

import logging
import os
from pathlib import Path
from typing import TYPE_CHECKING, ClassVar, Final

from sqlalchemy.engine import URL
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from .models import BaseSQLModel

if TYPE_CHECKING:
    from pathlib import Path

    from sqlalchemy.ext.asyncio import AsyncEngine


SQLALCHEMY_DEBUG: bool = os.environ.get('SQLALCHEMY_DEBUG', '').lower() in {
    'true',
    'yes',
}


class DatabaseEngine:
    """A connection to a database which stores models.

    Attributes:
        path (str): the relative path to the database.

    """

    _DRIVER: ClassVar[str] = 'sqlite+aiosqlite'

    _database: ClassVar[DatabaseEngine | None] = None

    @classmethod
    def get_engine(cls) -> DatabaseEngine:
        """Get the current database engine. If one does not exist, one will be created.

        Returns:
            DatabaseEngine: the current database engine.

        """
        if cls._database is None:
            cls._database = DatabaseEngine()
        return cls._database

    @classmethod
    def create_engine(cls, db_path: str | Path) -> DatabaseEngine:
        """Create a new database engine with a connection to the desired path.

        Args:
            db_path (str): the path at which to connect the engine.

        Returns:
            DatabaseEngine: the newly created database engine.

        """
        if isinstance(db_path, str):
            db_path = db_path.strip()
        cls._database = DatabaseEngine(db_path)
        logging.debug('Created database')
        return cls._database

    def __init__(self, db_path: str | Path = '') -> None:
        """Create a database engine without connecting to the database.

        Args:
            db_schema (type[DeclarativeBase]): a SQLAlchemy base model type which will
            be initialized with the database.
            db_path (str, optional): The relative path to the database. If left blank,
            a database in memory will be used. Defaults to ''.

        Raises:
            ValueError: if the db_path is not a legal file name.

        """
        # TODO: ensure that path is a legal file name
        if isinstance(db_path, str) and not db_path.isprintable():
            logging.error('invalid database pathname')
            raise ValueError('db path is invalid')
        db_path = str(db_path)
        self._session_factory: async_sessionmaker[AsyncSession] | None = None
        self.path: Final[str] = db_path if db_path != '' else ':memory:'

    async def create_all(self) -> None:
        """Initialize the connection to the database and create all tables.

        Raises:
            RuntimeError: if the database connection has already been established.

        """
        if self._session_factory is not None:
            logging.error('the database has already been created')
            raise RuntimeError('the database has already been created')

        # Initialize the database engine
        url: URL = URL.create(self._DRIVER, database=self.path)
        logging.debug(f'Initializing engine at "{str(url)}"')
        engine: AsyncEngine = create_async_engine(url, echo=SQLALCHEMY_DEBUG)

        # Create the database tables
        logging.debug('Creating metadata in synchronous context')
        async with engine.connect() as session:
            await session.run_sync(BaseSQLModel.metadata.create_all)
        logging.debug('Initializing asynchronous session factory')
        self._session_factory: async_sessionmaker[AsyncSession] = async_sessionmaker(
            bind=engine, expire_on_commit=False
        )

    def is_connected(self) -> bool:
        """Return True if the database is connected.

        Returns:
            bool: True if the database is connected.

        """
        return self._session_factory is not None

    def get_async_session_factory(self) -> async_sessionmaker[AsyncSession]:
        """Return a session factory that is associated with the database engine.

        Raises:
            RuntimeError: if the database has not yet been created.

        Returns:
            async_sessionmaker: an asynchronous session factory.

        """
        if self._session_factory is None:
            raise RuntimeError('the database has not been created yet')
        return self._session_factory

    def get_async_session(self) -> AsyncSession:
        """Return a session that is associated with the database engine.

        Raises:
            RuntimeError: if the database has not yet been created.

        Returns:
            AsyncSession: an asynchronous session.

        """
        factory: async_sessionmaker[AsyncSession] = self.get_async_session_factory()
        return factory()
