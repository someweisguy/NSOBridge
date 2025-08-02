from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from models import rulesets
from models.bout import GenericBoutModel
from models.jam import JamModel, TeamJamModel, TeamName
from models.models import SessionLocal, SQLModel, engine
from models.team import RosterModel, TeamModel
from models.time import ClockModel


async def setup_db() -> None:
    async with engine.connect() as connection:
        await connection.run_sync(SQLModel.metadata.create_all)


def get_db(**kwargs: Any) -> AsyncSession:
    session: AsyncSession = SessionLocal(**kwargs)
    return session


__all__ = (
    'GenericBoutModel',
    'ClockModel',
    'get_db',
    'JamModel',
    'RosterModel',
    'setup_db',
    'TeamJamModel',
    'TeamModel',
    'TeamName',
    'rulesets',
)
