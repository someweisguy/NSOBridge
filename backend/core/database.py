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


class Memento(Protocol):
    async def restore(self) -> Memento: ...


class Database:
    PROTOCOL: Final[str] = 'sqlite+aiosqlite:///'

    def __init__(
        self, db_path: Path | str = Path(':memory:'), debug: bool = False
    ) -> None:
        url: str = Database.PROTOCOL + str(db_path)
        self.engine: AsyncEngine = create_async_engine(url, echo=debug)
        self.session_factory = async_sessionmaker(
            bind=self.engine, expire_on_commit=False
        )
        self.connected: bool = True

    async def get_async_session(self) -> AsyncGenerator[AsyncSession, None]:
        if not self.connected:
            raise RuntimeError('This database connection is not open')
        async with self.session_factory() as session, session.begin():
            yield session
            await session.commit()

    async def dispose(self) -> None:
        if not self.connected:
            return
        await self.engine.dispose()
        self.connected = False


_db: Database | None = None


def get_db() -> Database:
    if _db is None:
        raise RuntimeError('A Database connection has not yet been established')
    return _db


AsyncSessionDepends: TypeAlias = Annotated[AsyncSession, Depends(_db.get_async_session)]
