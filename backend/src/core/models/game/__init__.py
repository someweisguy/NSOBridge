from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import sessionmaker

from core.models.game.base import SQLBase
from core.models.game.bout import SQLBout
from core.models.game.jam import SQLJam, SQLTeamJam
from core.models.game.team import SQLTeam
from core.models.game.time import SQLClock

engine: Engine = create_engine('sqlite+pysqlite:///data.db', echo=True)
Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
SQLBase.metadata.create_all(engine)


async def get_db():
    with Session() as db:
        yield db


async def get_bout(bout_id: int) -> SQLBout:
    with Session() as db:
        return db.get(SQLBout, bout_id)
        
    


__all__ = ('engine', 'SQLBout', 'SQLClock', 'SQLJam', 'SQLTeamJam', 'SQLTeam')
