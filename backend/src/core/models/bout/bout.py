from __future__ import annotations

from datetime import timedelta
from typing import ClassVar, Final, Sequence

from nanoid import non_secure_generate
from pydantic import Field, computed_field, field_validator

from core.models import ProjectModel
from core.models.bout.bad_words import BAD_WORDS
from core.models.bout.jam import Jam, JamId
from core.models.bout.team import Team
from core.models.bout.timeout import Timeout
from core.models.time.alarm import Alarm

MIN_REQUIRED_TEAMS: Final[int] = 2


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

    @classmethod
    @field_validator('teams', mode='after')
    def teams_validator(cls, value: Sequence[Team]) -> None:
        if len(value) != len(set(value)):
            raise ValueError('Bout Teams cannot contain duplicates')
        return value

    class Clocks(ProjectModel):
        intermission: Alarm = Field(Alarm(), final=True)
        game: Alarm = Field(Alarm(), final=True)
        lineup: Alarm = Field(Alarm(), final=True)
        jam: Alarm = Field(Alarm(), final=True)

    id: str = Field(default_factory=generate_id, init=False, final=True)
    ruleset_name: str = Field(final=True)
    clocks: Clocks = Field(Clocks(), init=False, final=True)
    teams: Sequence[Team] = Field([], init=False)
    timeouts: list[Timeout] = Field([], init=False, final=True)
    _jams: Final[list[list[Jam]]] = [[]]

    def __init__(self, ruleset_name: str) -> None:
        super().__init__(ruleset_name=ruleset_name)
        Bout.bouts[self.id] = self

    @computed_field
    def num_jams(self) -> list[int]:
        return [len(period) for period in self._jams]

    def get_jam(self, period_num: int, jam_num: int) -> Jam:
        return self._jams[period_num][jam_num]

    def add_jam(self) -> Jam:
        if len(self.teams) < MIN_REQUIRED_TEAMS:
            raise RuntimeError(f'{MIN_REQUIRED_TEAMS} Teams are required to add a Jam')
        period: list[Jam] = self._jams[-1]
        jam: Jam = Jam((len(self._jams), len(period)))
        period.append(jam)
        return jam

    def pop_jam(self) -> Jam:
        period: list[Jam] = self._jams[-1]
        return period.pop()

    def get_latest_jam_id(self) -> JamId:
        period_num: int = len(self._jams)
        return JamId(period_num, len(self._jams[period_num]))

    def get_active_jam_id(self) -> JamId | None:
        latest_jam_id: JamId = self.get_latest_jam_id()
        jam_num: int = latest_jam_id.jam
        if self._jams[latest_jam_id.period][latest_jam_id.jam].start_timestamp is None:
            if latest_jam_id.jam == 0:
                return None  # There is no active Jam
            jam_num -= 1
        return JamId(len(self._jams), jam_num)

    def timeout_is_running(self) -> bool:
        return len(self.timeouts) > 0 and self.timeouts[-1].is_running()


__all__ = ('Bout',)
