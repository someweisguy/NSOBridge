from __future__ import annotations

from abc import abstractmethod
from typing import Final, final

from sqlalchemy.ext.asyncio import AsyncSession

from models.bout import BoutModel
from models.jam import JamModel, TeamName


class AbstractReferee:
    @final
    def __init__(self, db: AsyncSession) -> None:
        self.db: Final[AsyncSession] = db

    @abstractmethod
    async def add_trip(self, jam: JamModel, team: TeamName, passes: int) -> None: ...

    # end_period

    @abstractmethod
    async def get_score(self, bout: BoutModel) -> tuple[int, ...]: ...

    @abstractmethod
    async def set_lead(self, jam: JamModel, team: TeamName, lead: bool) -> None: ...

    @abstractmethod
    async def set_lost(self, jam: JamModel, team: TeamName, lost: bool) -> None: ...

    @abstractmethod
    async def set_star_pass(
        self, jam: JamModel, team: TeamName, star_pass: bool
    ) -> None: ...

    # setup_game

    @abstractmethod
    async def start_jam(self, bout: BoutModel) -> None: ...

    @abstractmethod
    async def stop_jam(self, bout: BoutModel) -> None: ...

    @abstractmethod
    async def start_timeout(self, bout: BoutModel) -> None: ...

    @abstractmethod
    async def stop_timeout(self, bout: BoutModel) -> None: ...
