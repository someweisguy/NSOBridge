from __future__ import annotations

from datetime import datetime
from functools import cached_property
from typing import TYPE_CHECKING, ClassVar, Final, Literal, Sequence

from pydantic import Field, computed_field, model_serializer

from core.models import ModelKey, ProjectModel
from core.models.bout.team import Team
from core.models.time.timer import Timer

if TYPE_CHECKING:
    from core.models.bout.bout import Bout

type StopReason = Literal['called', 'time', 'injury', 'other']


class JamId(ProjectModel):
    period: int = Field(final=True)
    jam: int = Field(final=True)

    def __hash__(self) -> int:
        return hash((self.period, self.jam))

    def __init__(self, period: int, jam: int) -> None:
        super().__init__(period=period, jam=jam)

    @model_serializer
    def _model_serializer(self) -> tuple[int, int]:
        return self.period, self.jam


class Trip(ProjectModel):
    points: int = Field()
    timestamp: datetime = Field()

    def __init__(self, passes: int, timestamp: datetime) -> None:
        super().__init__(points=passes, timestamp=timestamp)


class TeamJam(ProjectModel):
    _team: Final[Team]
    _jam: Final[Jam]
    lead: bool = Field(False, init=False)
    lost: bool = Field(False, init=False)
    star_pass: int | None = Field(None, init=False)
    trips: list[Trip] = Field([], final=True, init=False)

    def __hash__(self):
        return hash(self._jam)

    def __init__(self, team: Team, jam: Jam) -> None:
        super().__init__()
        self._team = team
        self._jam = jam

    @property
    def id(self) -> JamId:
        return self._jam.id

    @property
    def team(self) -> Team:
        return self._team


class Jam(Timer):
    REQUIRED_NUM_TEAMS: ClassVar[Final[int]] = 2

    _bout: Bout
    id: JamId = Field(final=True)
    stop_reason: StopReason | None = Field(None, init=False)
    _team_jams: list[TeamJam] = []

    def __hash__(self):
        return hash(self.id)

    def __init__(self, bout: Bout, period: int, jam: int) -> None:
        super().__init__(id=JamId(period, jam))
        self._bout = bout
        
    @cached_property
    def key(self) -> ModelKey:
        return 'jam', self._bout.id, self.id.period, self.id.jam

    @computed_field
    @property
    def team_jams(self) -> tuple[TeamJam, TeamJam]:
        return tuple(self._team_jams)

    def assign_teams(self, teams: Sequence[Team]) -> None:
        if len(teams) > Jam.REQUIRED_NUM_TEAMS:
            raise ValueError(f'A Jam may only have {Jam.REQUIRED_NUM_TEAMS} Teams')
        if teams[0] is teams[1]:
            raise ValueError('Jam Teams cannot contain duplicates')
        for team in teams:
            team_jam: TeamJam = TeamJam(team, self)
            self._team_jams.append(team_jam)
            team.add_team_jam(team_jam)

    def start(self, timestamp: datetime) -> None:
        if len(self._team_jams) < Jam.REQUIRED_NUM_TEAMS:
            raise RuntimeError(
                f'At least {Jam.REQUIRED_NUM_TEAMS} Teams are required to start a Jam'
            )
        super().start(timestamp)

    def lead_is_declared(self) -> bool:
        return any(team_jam.lead for team_jam in self.team_jams)
