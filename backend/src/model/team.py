from abc import ABC
from datetime import timedelta
from typing import ClassVar, Final, Literal

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

type TeamString = Literal['home', 'away']


class ProjectModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        validate_by_alias=True,
        validate_by_name=True,
    )


class TeamAttribute[T](ProjectModel):
    home: T
    away: T

    def __getitem__(self, key: TeamString) -> T:
        return getattr(self, key)


class Team(ProjectModel):
    class ClockStops(ProjectModel):
        timeout: int = 3
        review: int = 1

    name: str = ''
    mnemonic: str = ''
    clock_stops: ClockStops = Field(default_factory=ClockStops, final=True)


class RefereeContext(TeamAttribute[Team]):
    PERIOD_DURATION: ClassVar[timedelta] = timedelta(minutes=30)
    JAM_DURATION: ClassVar[timedelta] = timedelta(minutes=2)
    LINEUP_DURATION: ClassVar[timedelta] = timedelta(seconds=30)

    home: Team = Field(Team(), final=True)
    away: Team = Field(Team(), final=True)
    # TODO: add Officials


class AbstractReferee(ProjectModel, ABC):
    context: Final[RefereeContext]  # Fields marked Final are omitted from model dumps

    def get_context(self) -> RefereeContext:
        return self._context
