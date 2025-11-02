from abc import ABC
from inspect import Traceback
from typing import Any, Callable, override

from core import Command
from core.database import SessionLocal
from sqlalchemy.ext.asyncio import AsyncSession

from .bout import GenericBoutModel
from .jam import JamModel, TeamJamModel, TeamName
from .models import CacheableModel, callbacks
from .series import SeriesModel
from .team import RosterModel, TeamModel
from .time import ClockModel


def get_db(**kwargs: Any) -> AsyncSession:
    session: AsyncSession = SessionLocal(**kwargs)
    return session


def on_update(
    callback: Callable[[set[CacheableModel]], None],
) -> Callable[[set[CacheableModel]], None]:
    callbacks.append(callback)
    return callback


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
    'TeamJamModel',
    'TeamModel',
    'TeamName',
)
