from __future__ import annotations

from datetime import datetime, timedelta
from functools import cached_property
from typing import Any, Callable, ClassVar, Final, Literal, Sequence

from nanoid import non_secure_generate
from pydantic import Field, computed_field, field_validator

from core.models import Gettable, ModelKey, ProjectModel
from core.models.bout.bad_words import BAD_WORDS
from core.models.bout.jam import Jam, TeamJam
from core.models.bout.team import Roster, Team
from core.models.time.alarm import Alarm
from core.models.time.timer import Timer

type Rule[*T] = Callable[[*T], tuple[Gettable, ...]]


class Timeout(Timer):
    period_num: int = Field()
    jam_num: int = Field()
    clock_elapsed: timedelta = Field()
    is_review: bool = Field(False, init=False)
    type: Literal['timeout', 'review', 'unknown'] = Field('unknown', init=False)
    team: Team | None = Field(None, init=False)
    details: str = Field('', init=False)
    result: str = Field('', init=False)
    retained: bool = Field(False, init=False)

    @classmethod
    def create(cls, period_num: int, jam_num: int, clock_elapsed: timedelta) -> Timeout:
        timeout: Timeout = Timeout(
            period_num=period_num, jam_num=jam_num, clock_elapsed=clock_elapsed
        )
        return timeout


class Bout(ProjectModel):
    MAX_NUM_PERIODS: ClassVar[Final[int]] = 3

    bouts: ClassVar[Final[dict[str, Bout]]] = {}

    @classmethod
    def generate_id(cls) -> str:
        for _ in range(50):
            bout_id: str = non_secure_generate('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 4)
            if bout_id not in BAD_WORDS and bout_id not in Bout.bouts.keys():
                return bout_id
        raise RuntimeError('Unable to generate a valid Bout ID')

    @field_validator('teams', mode='after')
    @classmethod
    def teams_validator(cls, teams: Sequence[Team]) -> Sequence[Team]:
        MIN_NUM_TEAMS: int = 2
        if len(teams) < MIN_NUM_TEAMS:
            raise ValueError('A Bout requires at least 2 Teams')
        if any(teams.count(team) > 1 for team in teams):
            raise ValueError('A Bout cannot contain duplicate Teams')
        return teams

    class _Clocks(ProjectModel):
        intermission: Alarm = Field(default_factory=Alarm)
        game: Alarm = Field(default_factory=Alarm)
        lineup: Alarm = Field(default_factory=Alarm)
        jam: Alarm = Field(default_factory=Alarm)

    id: str = Field(init=False)
    is_final: bool = Field(False, init=False)
    clocks: _Clocks = Field(_Clocks(), init=False)
    teams: tuple[Team, ...] = Field()
    timeouts: list[Timeout] = Field([], init=False)
    referee: Referee = Field(alias='ruleset')
    _periods: list[list[Jam]] = []

    @classmethod
    def create(cls, *, rosters: Sequence[Roster], referee: Referee) -> Bout:
        teams: tuple[Team, ...] = tuple(Team.create(roster) for roster in rosters)
        bout: Bout = Bout(id=Bout.generate_id(), teams=teams, referee=referee)

        bout.referee.setup_game(bout)
        Bout.bouts[bout.id] = bout
        return bout

    def model_post_init(self, context: Any):
        if len(self._periods) == 0:
            self._periods.append([Jam(self, 0, 0)])

    @cached_property
    def key(self) -> ModelKey:
        return ('bout', self.id)

    @computed_field
    @property
    def num_jams(self) -> tuple[int, ...]:
        return tuple(len(period) for period in self._periods)

    def get_jam(self, period_num: int, jam_num: int) -> Jam:
        return self._periods[period_num][jam_num]

    def get_latest_jam(self) -> Jam:
        return self.get_jam(-1, -1)

    def get_active_jam(self) -> Jam | None:
        latest_jam: Jam = self.get_latest_jam()
        jam_num: int = latest_jam.jam_num
        if not latest_jam.is_running():
            if jam_num == 0:
                return None  # There is no active Jam
            jam_num -= 1
        return self.get_jam(-1, jam_num)

    def start_jam(self, timestamp: datetime) -> None:
        MIN_NUM_TEAMS: Final[int] = 2
        if len(self.get_latest_jam().team_jams) < MIN_NUM_TEAMS:
            raise RuntimeError(
                f'Cannot start a Jam with fewer than {MIN_NUM_TEAMS} Teams'
            )
        jam: Jam = self.get_latest_jam()
        if jam.is_running():
            raise RuntimeError('Cannot start a Jam when one is already running')
        jam.start_timestamp = timestamp

    def end_jam(self, timestamp: datetime) -> None:
        jam: Jam = self.get_latest_jam()
        if not jam.is_running():
            raise RuntimeError('Cannot end a Jam when one is not already running')
        jam.end_timestamp = timestamp

        # Append a new Jam to the latest period
        period: list[Jam] = self._periods[-1]
        period.append(Jam(self, len(self._periods) - 1, len(period)))

    def end_period(self) -> None:
        jam: Jam = self.get_latest_jam()
        if jam.is_running():
            raise RuntimeError('Cannot end the Period when a Jam is running')
        self._periods[-1].pop()
        self._periods.append([])
        self._periods[-1].append(Jam(self, len(self._periods) - 1, 0))

    def is_in_timeout(self) -> bool:
        return len(self.timeouts) > 0 and self.timeouts[-1].is_running()


class Referee(ProjectModel):
    name: str = Field()
    setup_game: Rule[Bout]
    start_jam: Rule[Bout, datetime]
    stop_jam: Rule[Bout, datetime]
    call_timeout: Rule[Bout, datetime]
    end_timeout: Rule[Bout, datetime]
    end_period: Rule[Bout, datetime]

    add_trip: Rule[TeamJam, int]
    set_lead: Rule[TeamJam, bool]
    set_lost: Rule[TeamJam, bool]
    set_star_pass: Rule[TeamJam, bool]
