from __future__ import annotations

from datetime import datetime, timedelta
from functools import cached_property
from typing import Callable, ClassVar, Final, Literal, Sequence

from nanoid import non_secure_generate
from pydantic import Field, computed_field, field_validator

from core.models import Gettable, ModelKey, ProjectModel
from core.models.bout.bad_words import BAD_WORDS
from core.models.bout.jam import Jam, JamId, TeamJam
from core.models.bout.team import Roster, Team
from core.models.time.alarm import Alarm
from core.models.time.timer import Timer

type Rule[*T] = Callable[[*T], tuple[Gettable, ...]]


class Timeout(Timer):
    jam_id: JamId = Field(final=True)
    period_clock_elapsed: timedelta = Field(final=True)
    is_review: bool = Field(False, init=False)
    type: Literal['timeout', 'review', 'unknown'] = Field('unknown', init=False)
    team: Team | None = Field(None, init=False)
    details: str = Field('', init=False)
    result: str = Field('', init=False)
    retained: bool = Field(False, init=False)

    def __init__(self, jam_id: JamId, period_clock_elapsed: timedelta) -> None:
        super().__init__(jam_id=jam_id, period_clock_elapsed=period_clock_elapsed)


class Bout(ProjectModel):
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
    def teams_validator(cls, teams: Sequence[Team]) -> None:
        MIN_NUM_TEAMS: int = 2
        if len(teams) < MIN_NUM_TEAMS:
            raise ValueError('A Bout requires at least 2 Teams')
        if any(teams.count(team) > 1 for team in teams):
            raise ValueError('A Bout cannot contain duplicate Teams')
        return teams

    class _Clocks(ProjectModel):
        intermission: Alarm = Field(Alarm(), final=True)
        game: Alarm = Field(Alarm(), final=True)
        lineup: Alarm = Field(Alarm(), final=True)
        jam: Alarm = Field(Alarm(), final=True)

    id: str = Field(init=False, final=True)
    clocks: _Clocks = Field(_Clocks(), final=True, init=False)
    teams: tuple[Team, ...] = Field(final=True)
    timeouts: list[Timeout] = Field([], final=True, init=False)
    referee: Referee = Field(alias='ruleset', final=True)
    _jams: Final[list[list[Jam]]] = []

    def __init__(self, *, rosters: Sequence[Roster], referee: Referee) -> None:
        teams: tuple[Team, ...] = tuple(Team(roster) for roster in rosters)
        super().__init__(id=Bout.generate_id(), teams=teams, referee=referee)
        self.referee.setup_game(self)
        Bout.bouts[self.id] = self

    @cached_property
    def key(self) -> ModelKey:
        return ('bout', self.id)

    @computed_field
    @property
    def num_jams(self) -> tuple[int, int, int]:
        num_jams: list[int] = [0, 0, 0]
        for i, period in enumerate(self._jams):
            num_jams[i] = len(period)
        return tuple(num_jams)

    def get_jam(self, period_num: int, jam_num: int) -> Jam:
        return self._jams[period_num][jam_num]

    def get_latest_jam(self) -> Jam:
        return self.get_jam(-1, -1)

    def get_active_jam(self) -> Jam | None:
        latest_jam: Jam = self.get_latest_jam()
        jam_num: int = latest_jam.id.jam
        if latest_jam._start_timestamp is None:
            if latest_jam.id.jam == 0:
                return None  # There is no active Jam
            jam_num -= 1
        return self.get_jam(len(self._jams) - 1, jam_num)

    def push_jam(self) -> Jam:
        period: list[Jam] = self._jams[-1]
        jam: Jam = Jam(self, len(self._jams) - 1, len(period))
        period.append(jam)
        return jam

    def pop_jam(self) -> Jam:
        period: list[Jam] = self._jams[-1]
        return period.pop()

    def push_period(self) -> None:
        if len(self._jams) > 0:
            self._jams[-1] = [
                jam for jam in self._jams[-1] if jam._start_timestamp is not None
            ]
        self._jams.append([])

    def timeout_is_running(self) -> bool:
        return len(self.timeouts) > 0 and self.timeouts[-1].is_running()


class Referee(ProjectModel):
    name: str = Field(final=True)
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
