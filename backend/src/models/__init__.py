from typing import Any, Callable

from sqlalchemy import event
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session, UOWTransaction

from models import rulesets
from models.bout import GenericBoutModel
from models.jam import JamModel, TeamJamModel, TeamName
from models.models import CacheableModel, SessionLocal, SQLModel, engine
from models.team import RosterModel, TeamModel
from models.time import ClockModel


def recursive_add(model: SQLModel, cacheables: set[CacheableModel]) -> None:
    for parent in model.parents:
        if isinstance(parent, CacheableModel):
            cacheables.add(parent)
            recursive_add(parent, cacheables)


def test_hook(session: Session, flush_context: UOWTransaction) -> None:
    # Get each cacheable model that is new, dirty, or deleted
    models: set[SQLModel] = {
        item
        for identity_map in [session.dirty, session.deleted]
        for item in identity_map
        if isinstance(item, SQLModel)
    }
    cacheables: set[CacheableModel] = {
        item for item in session.new if isinstance(item, CacheableModel)
    }
    # Add the parents of each cacheable to the update list
    for model in models:
        recursive_add(model, cacheables)

    print(list(cacheables))


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
