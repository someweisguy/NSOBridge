from __future__ import annotations

from datetime import datetime
from typing import Final, Literal, Sequence

from pydantic import Field, computed_field, field_validator

from core.models import ProjectModel
from core.models.bout.team import Team
from core.models.time.timer import Timer

type StopReason = Literal['called', 'time', 'injury', 'other']


class JamId(ProjectModel):
    period: int = Field(final=True)
    jam: int = Field(final=True)

    def __init__(self, period: int, jam: int) -> None:
        self.period = period
        self.jam = jam


class Trip(ProjectModel):
    points: int
    timestamp: datetime


class TeamJam(ProjectModel):
    _parent_jam: Jam
    lead: bool = Field(False, init=False)
    lost: bool = Field(False, init=False)
    star_pass: int | None = Field(None, init=False)
    trips: list[Trip] = Field([], init=False, final=True)

    def __init__(self, parent: Jam) -> None:
        super().__init__()
        self._parent_jam = parent


class Jam(Timer):
    @field_validator('teams', mode='after')
    @classmethod
    def teams_validator(cls, value: Sequence[TeamJam]) -> None:
        MAX_ALLOWED_TEAMS: Final[int] = 2
        if len(value) > MAX_ALLOWED_TEAMS:
            raise ValueError(f'A Jam may only have {MAX_ALLOWED_TEAMS} Teams')
        if value[0] is value[1]:
            raise ValueError('Jam Teams cannot contain duplicates')
        return value

    id: JamId = Field(final=True)
    team_jams: Sequence[TeamJam] = Field([], init=False, exclude=True, final=True)

    def __init__(self, period: int, jam: int) -> None:
        super().__init__(id=JamId(period, jam))

    @computed_field
    @property
    def home(self) -> TeamJam:
        return self.team_jams[Team.HOME]

    @computed_field
    @property
    def away(self) -> TeamJam:
        return self.team_jams[Team.AWAY]

    def lead_is_declared(self) -> bool:
        return any(team.lead for team in self.team_jams)
