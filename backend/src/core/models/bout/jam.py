from __future__ import annotations

from datetime import datetime
from typing import Literal, Sequence

from pydantic import Field, computed_field, field_validator

from core.models import ProjectModel
from core.models.bout.team import Team
from core.models.time.timer import Timer

type StopReason = Literal['called', 'time', 'injury', 'other']


class JamId(ProjectModel):
    period: int = Field(final=True)
    jam: int = Field(final=True)

    def __init__(self, period: int, jam: int) -> None:
        super().__init__(period=period, jam=jam)


class Trip(ProjectModel):
    points: int
    timestamp: datetime

    def __init__(self, passes: int, timestamp: datetime) -> None:
        super().__init__(points=passes, timestamp=timestamp)


class TeamJam(ProjectModel):
    _parent: Jam
    lead: bool = Field(False, init=False)
    lost: bool = Field(False, init=False)
    star_pass: int | None = Field(None, init=False)
    trips: list[Trip] = Field([], init=False, final=True)

    def __init__(self, parent: Jam) -> None:
        super().__init__()
        self._parent = parent

    @property
    def id(self) -> JamId:
        return self._parent.id


class Jam(Timer):
    @field_validator('team_jams', mode='after')
    @classmethod
    def teams_validator(cls, value: Sequence[TeamJam]) -> Sequence[TeamJam]:
        MAX_ALLOWED_TEAMS: int = 2
        if len(value) > MAX_ALLOWED_TEAMS:
            raise ValueError(f'A Jam may only have {MAX_ALLOWED_TEAMS} Teams')
        if value[0] is value[1]:
            raise ValueError('Jam Teams cannot contain duplicates')
        return value

    id: JamId = Field(final=True)
    team_jams: Sequence[TeamJam] = Field([], init=False, exclude=True, final=True)
    stop_reason: StopReason | None = Field(None, init=False)

    def __init__(self, period: int, jam: int) -> None:
        super().__init__(id=JamId(period, jam))

    @computed_field
    @property
    def home(self) -> TeamJam | None:
        return self.team_jams[Team.HOME] if len(self.team_jams) > Team.HOME else None

    @home.setter
    def home(self, team_jam: TeamJam) -> None:
        self.team_jams[Team.HOME] = team_jam

    @computed_field
    @property
    def away(self) -> TeamJam | None:
        return self.team_jams[Team.AWAY] if len(self.team_jams) > Team.AWAY else None

    @away.setter
    def away(self, team_jam: TeamJam) -> None:
        self.team_jams[Team.AWAY] = team_jam

    def start(self, timestamp: datetime) -> None:
        if self.home is None or self.away is None:
            raise RuntimeError('At least 2 Teams are required to start a Jam')
        super().start(timestamp)

    def lead_is_declared(self) -> bool:
        return any(team_jam.lead for team_jam in self.team_jams)
