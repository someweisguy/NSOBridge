from typing import Any, Callable

from sqlalchemy import event
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session

from models import rulesets
from models.bout import GenericBoutModel
from models.jam import JamModel, TeamJamModel, TeamName
from models.models import SessionLocal, SQLModel, engine
from models.team import RosterModel, TeamModel
from models.time import ClockModel

pre_commit_hook: Callable[[Session], None] | None = None


async def setup_db() -> None:
    async with engine.connect() as connection:
        await connection.run_sync(SQLModel.metadata.create_all)


def get_db(**kwargs: Any) -> AsyncSession:
    session: AsyncSession = SessionLocal(**kwargs)
    if pre_commit_hook is not None:
        event.listen(session.sync_session, 'before_commit', pre_commit_hook)
    return session


__all__ = (
    'GenericBoutModel',
    'ClockModel',
    'get_db',
    'JamModel',
    'pre_commit_hook',
    'RosterModel',
    'setup_db',
    'TeamJamModel',
    'TeamModel',
    'TeamName',
    'rulesets',
)
