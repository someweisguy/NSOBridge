from abc import ABC
from collections.abc import AsyncGenerator
from inspect import Traceback
from typing import Annotated, Any, Callable, TypeAlias, override

from core import Command
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from .bout import GenericBoutModel
from .jam import JamModel, TeamJamModel, TeamName
from .models import CacheableModel, SessionLocal, SQLModel, callbacks, engine
from .series import SeriesModel
from .team import RosterModel, TeamModel
from .time import ClockModel


async def setup() -> None:
    async with engine.connect() as connection:
        await connection.run_sync(SQLModel.metadata.create_all)


def get_db(**kwargs: Any) -> AsyncSession:
    session: AsyncSession = SessionLocal(**kwargs)
    return session


def on_update(
    callback: Callable[[set[CacheableModel]], None],
) -> Callable[[set[CacheableModel]], None]:
    callbacks.append(callback)
    return callback


async def _inject_db() -> AsyncGenerator[AsyncSession]:
    async with get_db() as session:
        yield session
        await session.commit()


AsyncSessionDepends: TypeAlias = Annotated[AsyncSession, Depends(_inject_db)]


class DatabaseCommand(Command, ABC):
    def __init__(self) -> None:
        self.session: AsyncSession = get_db()

    @override
    async def __aenter__(self) -> None:
        _ = await self.session.begin()

    @override
    async def __aexit__(
        self,
        exception_type: type[BaseException] | None,
        exception_value: BaseException | None,
        traceback: Traceback | None,
    ) -> None:
        await self.session.close()


__all__ = (
    'AsyncSession',
    'CacheableModel',
    'ClockModel',
    'GenericBoutModel',
    'get_db',
    'JamModel',
    'on_update',
    'RosterModel',
    'SeriesModel',
    'setup',
    'TeamJamModel',
    'TeamModel',
    'TeamName',
)
