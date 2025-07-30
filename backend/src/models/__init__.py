from typing import Any, Callable

from sqlalchemy import event
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session, UOWTransaction

from models import rulesets
from models.bout import GenericBoutModel
from models.jam import JamModel, TeamJamModel, TeamName
from models.models import SessionLocal, SQLModel, engine
from models.team import RosterModel, TeamModel
from models.time import ClockModel


def test_hook(session: Session, flush_context: UOWTransaction) -> None:
    print(
        [
            [type(i).__name__ for i in collection]
            for collection in [session.dirty, session.new, session.deleted]
        ]
    )


pre_commit_hook: Callable[[Session, UOWTransaction], None] | None = test_hook


async def setup_db() -> None:
    async with engine.connect() as connection:
        await connection.run_sync(SQLModel.metadata.create_all)


def get_db(**kwargs: Any) -> AsyncSession:
    session: AsyncSession = SessionLocal(**kwargs)
    if pre_commit_hook is not None:
        event.listen(session.sync_session, 'after_flush', pre_commit_hook)
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
