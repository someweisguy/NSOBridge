from typing import Any, Callable

from sqlalchemy.ext.asyncio import AsyncSession

from models import rulesets
from models.bout import GenericBoutModel, GenericDataBoutModel
from models.jam import JamModel, TeamJamModel, TeamName
from models.models import CacheableModel, SessionLocal, SQLModel, callbacks, engine
from models.series import SeriesModel
from models.team import RosterModel, TeamModel
from models.time import ClockModel


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


__all__ = (
    'AsyncSession',
    'ClockModel',
    'GenericBoutModel',
    'GenericDataBoutModel',
    'get_db',
    'JamModel',
    'on_update',
    'RosterModel',
    'rulesets',
    'SeriesModel',
    'setup',
    'TeamJamModel',
    'TeamModel',
    'TeamName',
)
