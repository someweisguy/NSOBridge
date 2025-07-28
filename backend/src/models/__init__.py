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


async def get_bout(bout_id: int) -> GenericBoutModel:
    async with get_db() as db:
        bout: GenericBoutModel | None = await db.get(GenericBoutModel, bout_id)
        if bout is None:
            raise KeyError(f'Bout was not found ({bout_id=})')
        return bout


__all__ = (
    'GenericBoutModel',
    'ClockModel',
    'JamModel',
    'pre_commit_hook',
    'RosterModel',
    'TeamJamModel',
    'TeamModel',
    'TeamName',
    'rulesets',
)
