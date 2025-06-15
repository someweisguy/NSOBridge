from __future__ import annotations

from datetime import datetime
from typing import Literal, Sequence

from pydantic import Field, computed_field

from core.models import ProjectModel
from core.models.bout.team import Team
from core.models.time.timer import Timer

type StopReason = Literal['called', 'time', 'injury', 'other']


class JamId(ProjectModel):
    period: int = Field(final=True)
    jam: int = Field(final=True)

    def __hash__(self):
        return hash((self.period, self.jam))

    def __init__(self, period: int, jam: int) -> None:
        super().__init__(period=period, jam=jam)


class Trip(ProjectModel):
    points: int = Field()
    timestamp: datetime = Field()

    def __init__(self, passes: int, timestamp: datetime) -> None:
        super().__init__(points=passes, timestamp=timestamp)


class TeamJam(ProjectModel):
    _parent: Jam
    lead: bool = Field(False, init=False)
    lost: bool = Field(False, init=False)
    star_pass: int | None = Field(None, init=False)
    trips: list[Trip] = Field([], final=True, init=False)
    
    def __hash__(self):
        return hash(self._parent)

    def __init__(self, parent: Jam) -> None:
        super().__init__()
        self._parent = parent

    @property
    def id(self) -> JamId:
        return self._parent.id


class Jam(Timer):
    id: JamId = Field(final=True)
    stop_reason: StopReason | None = Field(None, init=False)
    _team_jams: list[TeamJam] = []

    def __hash__(self):
        return hash(self.id)

    def __init__(self, period: int, jam: int) -> None:
        super().__init__(id=JamId(period, jam))

    @property
    def home(self) -> TeamJam | None:
        return self._team_jams[Team.HOME] if len(self._team_jams) > Team.HOME else None

    @home.setter
    def home(self, team: Team) -> None:
        team_jam = TeamJam(self)
        self._team_jams[Team.HOME] = team_jam
        team.add_team_jam(team_jam)

    @property
    def away(self) -> TeamJam | None:
        return self._team_jams[Team.AWAY] if len(self._team_jams) > Team.AWAY else None

    @away.setter
    def away(self, team: Team) -> None:
        team_jam = TeamJam(self)
        self._team_jams[Team.AWAY] = team_jam
        team.add_team_jam(team_jam)

    @computed_field
    @property
    def team_jams(self) -> tuple[TeamJam, TeamJam]:
        return tuple(self._team_jams)

    @team_jams.setter
    def team_jams(self, teams: Sequence[Team]) -> None:
        MAX_ALLOWED_TEAMS: int = 2
        if len(teams) > MAX_ALLOWED_TEAMS:
            raise ValueError(f'A Jam may only have {MAX_ALLOWED_TEAMS} Teams')
        if teams[0] is teams[1]:
            raise ValueError('Jam Teams cannot contain duplicates')        
        for team in teams:
            team_jam: TeamJam = TeamJam(self)
            self._team_jams.append(team_jam)
            team.add_team_jam(team_jam)

    def start(self, timestamp: datetime) -> None:
        if self.home is None or self.away is None:
            raise RuntimeError('At least 2 Teams are required to start a Jam')
        super().start(timestamp)

    def lead_is_declared(self) -> bool:
        return any(team_jam.lead for team_jam in self.team_jams)
