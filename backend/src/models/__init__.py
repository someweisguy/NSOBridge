from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from models.base import SQLBase
from models.bout import SQLBout
from models.jam import SQLJam, SQLTeamJam
from models.team import SQLRoster, SQLTeam
from models.time import SQLClock

engine: AsyncEngine = create_async_engine('sqlite+aiosqlite:///data.db', echo=True)
SessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=engine)


async def setup_db() -> None:
    async with engine.connect() as connection:
        await connection.run_sync(SQLBase.metadata.create_all)


def get_db(**kwargs) -> AsyncSession:
    return SessionLocal(**kwargs)


async def get_bout(bout_id: int) -> SQLBout:
    async with get_db() as db:
        bout: SQLBout | None = await db.get(SQLBout, bout_id)
        if bout is None:
            raise KeyError(f'Bout was not found ({bout_id=})')
        return bout


__all__ = (
    'engine',
    'SQLBout',
    'SQLClock',
    'SQLJam',
    'SQLRoster',
    'SQLTeamJam',
    'SQLTeam',
)
