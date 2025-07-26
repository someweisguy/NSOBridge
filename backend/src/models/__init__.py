from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from models.models import SQLModel
from models.bout import BoutModel
from models.jam import JamModel, TeamJamModel
from models.team import RosterModel, TeamModel
from models.time import ClockModel

engine: AsyncEngine = create_async_engine('sqlite+aiosqlite:///data.db', echo=True)
SessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=engine)


async def setup_db() -> None:
    async with engine.connect() as connection:
        await connection.run_sync(SQLModel.metadata.create_all)


def get_db(**kwargs) -> AsyncSession:
    return SessionLocal(**kwargs)


async def get_bout(bout_id: int) -> BoutModel:
    async with get_db() as db:
        bout: BoutModel | None = await db.get(BoutModel, bout_id)
        if bout is None:
            raise KeyError(f'Bout was not found ({bout_id=})')
        return bout


__all__ = (
    'engine',
    'BoutModel',
    'ClockModel',
    'JamModel',
    'RosterModel',
    'TeamJamModel',
    'TeamModel',
)
