"""Base models for use in the other modules."""

from __future__ import annotations

import logging
import os
from datetime import timedelta
from typing import (
    TYPE_CHECKING,
    ClassVar,
    Final,
)
from uuid import UUID, uuid4

from sqlalchemy.engine import URL
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_object_session,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

if TYPE_CHECKING:
    from pathlib import Path

    from sqlalchemy.ext.asyncio import AsyncEngine


from .utils import _TimedeltaAsMilliseconds

CASCADE_CHILD: Final[str] = 'all, delete-orphan'
CASCADE_OTHER: Final[str] = 'expunge, save-update'

SQLALCHEMY_DEBUG: bool = os.environ.get('SQLALCHEMY_DEBUG', '').lower() in {
    'true',
    'yes',
}


class BaseSQLModel(DeclarativeBase):
    """The base model for all models in the database.

    This model has a standard SQL `id` field. It also includes a type annotation map to
    convert Python timedelta objects to an integer number of milliseconds.

    """

    uuid: Mapped[UUID] = mapped_column(default=uuid4, primary_key=True)

    __abstract__: bool = True
    __type_annotation_map__: dict = {timedelta: _TimedeltaAsMilliseconds}

    def get_parents(self) -> tuple[BaseSQLModel, ...]:
        """Asynchronously get a tuple of this model's direct parents.

        Returns:
            tuple[BaseSQLModel]: the immediate parents of this model.

        """
        raise NotImplementedError('get_parents() is not implemented in this model')

    def get_recursive_parents(self) -> tuple[BaseSQLModel, ...]:
        """Recursively and asynchronously get a tuple of this model's parents.

        This method is used to get the hierarchical branch of models that this model
        is on. This is useful to ensure that clients can refresh objects that have
        updated.

        Returns:
            tuple[BaseSQLModel]: the recursive parents of this model.

        """
        recursive_parents: list[BaseSQLModel] = list(self.get_parents())
        for parent in self.get_parents():
            if isinstance(parent, BaseSQLModel):
                recursive_parents.extend(parent.get_recursive_parents())
        return tuple(recursive_parents)

    def get_session(self) -> AsyncSession:
        """Get the session from the SQLAlchemy object.

        Raises:
            TypeError: if this object is not associated with a SQLAlchemy session.

        Returns:
            AsyncSession: the session with which this object is associated.

        """
        session: AsyncSession | None = async_object_session(self)
        if session is None:
            raise TypeError('This object is not associated with a SQL session')
        return session


class DatabaseEngine:
    """A connection to a database which stores models.

    Attributes:
        path (str): the relative path to the database.

    """

    _DRIVER: ClassVar[str] = 'sqlite+aiosqlite'

    def __init__(
        self, db_schema: type[DeclarativeBase], db_path: str | Path = ''
    ) -> None:
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
        self._db_schema: type[DeclarativeBase] = db_schema
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
            await session.run_sync(self._db_schema.metadata.create_all)
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
