from collections.abc import AsyncGenerator
from typing import Annotated, Any, Callable

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from .bout import GenericBoutModel, GenericDataBoutModel
from .jam import JamModel, TeamJamModel, TeamName
from .models import CacheableModel, SessionLocal, SQLModel, callbacks, engine
from .series import SeriesModel
from .team import RosterModel, TeamModel
from .time import ClockModel


async def setup() -> None:
    async with engine.connect() as connection:
        await connection.run_sync(SQLModel.metadata.create_all)


def get_db(**kwargs: Any) -> AsyncSession:
    session: AsyncSession = SessionLocal(**kwargs)
    return session


def on_update(
    callback: Callable[[set[CacheableModel]], None],
) -> Callable[[set[CacheableModel]], None]:
    callbacks.append(callback)
    return callback


async def _inject_db() -> AsyncGenerator[AsyncSession]:
    async with get_db() as session:
        yield session
        await session.commit()


DatabaseDepends = Annotated[AsyncSession, Depends(_inject_db)]


__all__ = (
    'AsyncSession',
    'CacheableModel',
    'ClockModel',
    'GenericBoutModel',
    'GenericDataBoutModel',
    'get_db',
    'JamModel',
    'on_update',
    'RosterModel',
    'SeriesModel',
    'setup',
    'TeamJamModel',
    'TeamModel',
    'TeamName',
)
