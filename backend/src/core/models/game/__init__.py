from typing import Final

from sqlalchemy import Engine, create_engine, event
from sqlalchemy.orm import Session, sessionmaker

from core.models.game.base import SQLBase
from core.models.game.bout import SQLBout
from core.models.game.jam import SQLJam, SQLTeamJam
from core.models.game.team import SQLTeam
from core.models.game.time import SQLClock

engine: Engine = create_engine('sqlite+pysqlite:///data.db', echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
SQLBase.metadata.create_all(engine)

SESSION_READ_ONLY: Final[str] = 'read_only'


@event.listens_for(Session, 'before_flush')
def before_flush(session: Session, flush_context, instances):
    if session.info.get(SESSION_READ_ONLY):
        raise Exception('Read-only session: flush not allowed')


async def get_db():
    with SessionLocal() as db:
        yield db


async def get_bout(bout_id: int) -> SQLBout | None:
    with SessionLocal() as db:
        return db.get(SQLBout, bout_id)


__all__ = ('engine', 'SQLBout', 'SQLClock', 'SQLJam', 'SQLTeamJam', 'SQLTeam')
