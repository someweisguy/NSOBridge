from abc import ABC
from dataclasses import dataclass, field
from inspect import Traceback
from typing import Final, override

from core import Command
from core.database import SessionLocal
from sqlalchemy.ext.asyncio import AsyncSession

from .bout import GenericBoutModel
from .jam import JamModel, TeamJamModel, TeamName
from .models import CacheableModel
from .series import SeriesModel
from .team import RosterModel, TeamModel
from .time import ClockModel


@dataclass
class DatabaseCommand(Command, ABC):
    session: Final[AsyncSession] = field(default=SessionLocal(), init=False)

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
        await self.session.commit()
        await self.session.close()


__all__ = (
    'CacheableModel',
    'ClockModel',
    'GenericBoutModel',
    'JamModel',
    'RosterModel',
    'SeriesModel',
    'TeamJamModel',
    'TeamModel',
    'TeamName',
)
