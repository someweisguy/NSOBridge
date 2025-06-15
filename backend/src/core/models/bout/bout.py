from __future__ import annotations

from datetime import timedelta
from typing import ClassVar, Final, Literal, Sequence

from nanoid import non_secure_generate
from pydantic import Field, computed_field, field_validator

from core.models import ProjectModel
from core.models.bout.bad_words import BAD_WORDS
from core.models.bout.jam import Jam, JamId
from core.models.bout.team import Team, TeamString
from core.models.time.alarm import Alarm
from core.models.time.timer import Timer, millisdelta


class Timeout[T = TeamString](Timer):
    jam_id: JamId = Field(final=True)
    period_clock_elapsed: millisdelta = Field(final=True)
    is_review: bool = Field(False, init=False)
    team: T | Literal['official'] | None = Field(None, init=False)
    details: str = Field('', init=False)
    result: str = Field('', init=False)
    retained: bool = Field(False, init=False)

    def __init__(self, jam_id: JamId, period_clock_elapsed: millisdelta) -> None:
        super().__init__(jam_id=jam_id, period_clock_elapsed=period_clock_elapsed)


class Bout(ProjectModel):
    PERIOD_DURATION: ClassVar[Final[timedelta]] = timedelta(minutes=30)
    LINEUP_DURATION: ClassVar[Final[timedelta]] = timedelta(seconds=30)
    JAM_DURATION: ClassVar[Final[timedelta]] = timedelta(minutes=2)

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
    def teams_validator(cls, value: Sequence[Team]) -> None:
        if len(value) != len(set(value)):
            raise ValueError('Bout Teams cannot contain duplicates')
        return value

    class _Clocks(ProjectModel):
        intermission: Alarm = Field(Alarm(), final=True)
        game: Alarm = Field(Alarm(), final=True)
        lineup: Alarm = Field(Alarm(), final=True)
        jam: Alarm = Field(Alarm(), final=True)

    id: str = Field(init=False, final=True)
    ruleset_name: str = Field(final=True)
    clocks: _Clocks = Field(_Clocks(), final=True, init=False)
    teams: tuple[Team] = Field((), init=False)
    timeouts: list[Timeout] = Field([], final=True, init=False)
    _jams: Final[list[list[Jam]]] = [[]]

    def __init__(self, ruleset_name: str) -> None:
        super().__init__(id=Bout.generate_id(), ruleset_name=ruleset_name)
        Bout.bouts[self.id] = self

        # Set default values
        self.clocks.game.set_alarm(Bout.PERIOD_DURATION)
        self.clocks.lineup.set_alarm(Bout.LINEUP_DURATION)
        self.clocks.jam.set_alarm(Bout.JAM_DURATION)
        self.push_jam()

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
        return self.get_jam(len(self._jams), jam_num)

    def push_jam(self) -> Jam:
        period: list[Jam] = self._jams[-1]
        jam: Jam = Jam(len(self._jams), len(period))
        period.append(jam)
        return jam

    def pop_jam(self) -> Jam:
        period: list[Jam] = self._jams[-1]
        return period.pop()

    def push_period(self) -> None:
        self._jams[-1] = [
            jam for jam in self._jams[-1] if jam._start_timestamp is not None
        ]
        self._jams.append([])

    def timeout_is_running(self) -> bool:
        return len(self.timeouts) > 0 and self.timeouts[-1].is_running()
