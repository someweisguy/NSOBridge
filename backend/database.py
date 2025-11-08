from __future__ import annotations

import os
from typing import TYPE_CHECKING, Annotated, Final, TypeAlias

from fastapi import Depends
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

if TYPE_CHECKING:
    from collections.abc import AsyncGenerator


DATABASE: Final[str] = os.environ.get('DB_PATH', ':memory:')
DEBUG: Final[bool] = os.environ.get('SQLALCHEMY_DEBUG', 'false').lower() in {
    'true',
    'yes',
}

engine: AsyncEngine = create_async_engine(
    f'sqlite+aiosqlite:///{DATABASE}',
    echo=DEBUG,
)
SessionFactory: async_sessionmaker[AsyncSession] = async_sessionmaker(
    bind=engine,
    expire_on_commit=False,
)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with SessionFactory() as session, session.begin():
        yield session
        await session.commit()


AsyncSessionDepends: TypeAlias = Annotated[AsyncSession, Depends(get_async_session)]
