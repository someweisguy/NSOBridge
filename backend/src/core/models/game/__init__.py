from sqlalchemy import Engine, create_engine

from core.models.game.base import SQLBase
from core.models.game.bout import SQLBout
from core.models.game.jam import SQLJam, SQLTeamJam
from core.models.game.team import SQLTeam

engine: Engine = create_engine('sqlite+pysqlite:///:memory:', echo=True)
SQLBase.metadata.create_all(engine)

__all__ = ('engine', 'SQLBout', 'SQLJam', 'SQLTeamJam', 'SQLTeam')
