from __future__ import annotations

from datetime import datetime
from functools import cached_property
from typing import TYPE_CHECKING, Final, Literal, Sequence

from pydantic import Field, computed_field, model_serializer

from core.models import ModelKey, ProjectModel
from core.models.bout.team import Team

if TYPE_CHECKING:
    from core.models.bout.bout import Bout

type StopReason = Literal['called', 'time', 'injury', 'other']


class JamId(ProjectModel):
    period: int = Field()
    jam: int = Field()

    def __hash__(self) -> int:
        return hash((self.period, self.jam))

    @model_serializer
    def _model_serializer(self) -> tuple[int, int]:
        return self.period, self.jam


class Trip(ProjectModel):
    points: int = Field()
    timestamp: datetime = Field()

    def __init__(self, passes: int, timestamp: datetime) -> None:
        super().__init__(points=passes, timestamp=timestamp)


class TeamJam(ProjectModel):
    _team: Team
    _jam: Jam
    lead: bool = Field(False, init=False)
    lost: bool = Field(False, init=False)
    star_pass: int | None = Field(None, init=False)
    trips: list[Trip] = Field([], init=False)

    def __hash__(self):
        return hash(self._jam)

    def __init__(self, team: Team, jam: Jam) -> None:
        super().__init__()
        self._team = team
        self._jam = jam

    @cached_property
    def jam_num(self) -> int:
        return self._jam.jam_num
    
    @cached_property
    def period_num(self) -> int:
        return self._jam.period_num

    @property
    def team(self) -> Team:
        return self._team

    @property
    def jam(self) -> Jam:
        return self._jam


class Jam(ProjectModel):
    _bout: Bout
    _period_num: int
    _jam_num: int
    _team_jams: list[TeamJam] = []

    start_timestamp: datetime | None = Field(None, init=False)
    end_timestamp: datetime | None = Field(None, init=False)
    stop_reason: StopReason | None = Field(None, init=False)

    def __hash__(self):
        return hash(self._jam_num)

    def __init__(self, bout: Bout, period_num: int, jam_num: int) -> None:
        super().__init__()
        self._bout = bout
        self._period_num = period_num
        self._jam_num = jam_num

    @cached_property
    def jam_num(self) -> int:
        return self._jam_num

    @cached_property
    def period_num(self) -> int:
        return self._period_num

    @cached_property
    def key(self) -> ModelKey:
        return 'jam', self.bout.id, self._period_num, self._jam_num

    @computed_field
    @property
    def team_jams(self) -> tuple[TeamJam, ...]:
        return tuple(self._team_jams)

    @property
    def bout(self) -> Bout:
        return self._bout

    def assign_teams(self, teams: Sequence[Team]) -> None:
        NUM_TEAMS: Final[int] = 2
        if len(teams) > NUM_TEAMS:
            raise ValueError(f'A Jam may only have {NUM_TEAMS} Teams')
        if teams[0] is teams[1]:
            raise ValueError('Jam Teams cannot contain duplicates')
        for team in teams:
            team_jam: TeamJam = TeamJam(team, self)
            self._team_jams.append(team_jam)
            team.add_team_jam(team_jam)

    def is_running(self) -> bool:
        return self.start_timestamp is not None and self.end_timestamp is None

    def lead_is_declared(self) -> bool:
        return any(team_jam.lead for team_jam in self.team_jams)
