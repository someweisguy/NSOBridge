from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import Session, sessionmaker

from core.models.game.base import SQLBase
from core.models.game.bout import SQLBout
from core.models.game.jam import SQLJam, SQLTeamJam
from core.models.game.team import SQLTeam
from core.models.game.time import SQLClock

engine: Engine = create_engine('sqlite+pysqlite:///data.db', echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
SQLBase.metadata.create_all(engine)


def get_db() -> Session:
    return SessionLocal()


async def get_bout(bout_id: int) -> SQLBout:
    with get_db() as db:
        bout: SQLBout | None = db.get(SQLBout, bout_id)
        if bout is None:
            raise KeyError(f'Bout was not found ({bout_id=})')
        return bout


__all__ = ('engine', 'SQLBout', 'SQLClock', 'SQLJam', 'SQLTeamJam', 'SQLTeam')
