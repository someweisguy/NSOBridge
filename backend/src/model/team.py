from abc import ABC
from typing import Literal

from pydantic import BaseModel, Field, PrivateAttr

type TeamString = Literal['home', 'away']


class TeamAttribute[T](BaseModel):
    home: T
    away: T

    def __getitem__(self, key: TeamString) -> T:
        return getattr(self, key)


class Team(BaseModel):
    class ClockStops(BaseModel):
        timeout: int = 3
        review: int = 1

    name: str = ''
    mnemonic: str = ''
    clock_stops: ClockStops = Field(ClockStops(), final=True)


class RefereeContext(TeamAttribute[Team]):
    home: Team = Field(Team(), final=True)
    away: Team = Field(Team(), final=True)
    # TODO: add Officials


class AbstractReferee(BaseModel, ABC):
    _context: RefereeContext = PrivateAttr()

    def get_context(self) -> RefereeContext:
        return self._context
