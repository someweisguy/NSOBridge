from __future__ import annotations

from abc import abstractmethod
from typing import Final, final

from sqlalchemy.ext.asyncio import AsyncSession

from models.bout import BoutModel


class AbstractReferee:
    @final
    def __init__(self, db: AsyncSession) -> None:
        self.db: Final[AsyncSession] = db

    # add_trip
    # call_timeout
    # end_period
    # end_timeout
    @abstractmethod
    async def get_score(self, bout: BoutModel) -> tuple[int, ...]: ...
    # set_lead
    # set_lost
    # set_star_pass
    # setup_game
    @abstractmethod
    async def start_jam(self, bout: BoutModel) -> None: ...

    @abstractmethod
    async def stop_jam(self, bout: BoutModel) -> None: ...
    
    @abstractmethod
    async def start_timeout(self, bout: BoutModel) -> None: ...
    
    @abstractmethod
    async def stop_timeout(self, bout: BoutModel) -> None: ...
