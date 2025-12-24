from __future__ import annotations

from pathlib import Path
from typing import TYPE_CHECKING, Annotated, Final, Protocol, TypeAlias

from fastapi import Depends
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

if TYPE_CHECKING:
    from collections.abc import AsyncGenerator

    from sqlalchemy.orm import DeclarativeBase


class Memento(Protocol):
    async def restore(self) -> Memento: ...


class Database:
    PROTOCOL: Final[str] = 'sqlite+aiosqlite:///'

    def __init__(
        self, db_path: Path | str = Path(':memory:'), debug: bool = False
    ) -> None:
        url: str = Database.PROTOCOL + str(db_path)
        self._engine: AsyncEngine = create_async_engine(url, echo=debug)
        self._session_factory = async_sessionmaker(
            bind=self._engine, expire_on_commit=False
        )
        self._connected: bool = True

    @property
    def session_factory(self) -> async_sessionmaker:
        return self._session_factory

    async def create_all(self, base_model: type[DeclarativeBase]) -> None:
        async with self._engine.connect() as database:
            await database.run_sync(base_model.metadata.create_all)

    async def get_async_session(self) -> AsyncGenerator[AsyncSession, None]:
        if not self._connected:
            raise RuntimeError('This database connection is not open')
        async with self._session_factory() as session, session.begin():
            yield session
            await session.commit()

    async def dispose(self) -> None:
        if not self._connected:
            return
        await self._engine.dispose()
        self._connected = False


_db: Database | None = None


def get_db() -> Database:
    if _db is None:
        raise RuntimeError('A Database connection has not yet been established')
    return _db


AsyncSessionDepends: TypeAlias = Annotated[AsyncSession, Depends(_db.get_async_session)]
