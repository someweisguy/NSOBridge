from __future__ import annotations

import os
from typing import TYPE_CHECKING, Annotated, TypeAlias

from fastapi import Depends
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

if TYPE_CHECKING:
    from collections.abc import AsyncGenerator


_DATABASE: str = os.environ.get('DB_PATH', ':memory:')
_DEBUG: bool = os.environ.get('SQLALCHEMY_DEBUG', 'false').lower() in {'true', 'yes'}


engine: AsyncEngine = create_async_engine(
    f'sqlite+aiosqlite:///{_DATABASE}', echo=_DEBUG
)
SessionFactory: async_sessionmaker[AsyncSession] = async_sessionmaker(
    bind=engine, expire_on_commit=False
)


async def _get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with SessionFactory() as session, session.begin():
        yield session
        await session.commit()


AsyncSessionDepends: TypeAlias = Annotated[AsyncSession, Depends(_get_async_session)]
