from datetime import datetime
from typing import Final

from pydantic import Field, computed_field

from model.jam import JamReferee
from model.team import RefereeContext, Team, TeamAttribute
from model.timer import TimeReferee


class Bout(RefereeContext):
    ruleset_name: str = Field(init=False, final=True)
    timer: TimeReferee = Field(init=False, final=True)
    jams: Final[JamReferee]

    def __init__(self, ruleset_name: str) -> None:
        super().__init__(
            ruleset_name=ruleset_name,
            timer=TimeReferee(context=self),
            jams=JamReferee(context=self),
            home=Team(),
            away=Team(),
        )

    @computed_field()
    def num_jams(self) -> tuple[int, int]:
        return self.jams.get_lens()

    @computed_field()
    def total_score(self) -> TeamAttribute[int]:
        return TeamAttribute[int](
            home=self.jams.get_total_score('home'),
            away=self.jams.get_total_score('away'),
        )

    def start_jam(self, timestamp: datetime) -> None:
        self.timer.start_jam(timestamp)
        self.jams.start_jam(timestamp)

    def stop_jam(self, timestamp: datetime) -> None:
        self.timer.stop_jam(timestamp)
        self.jams.stop_jam(timestamp)

    def call_timeout(self, timestamp: datetime) -> None:
        period_num, jam_num = self.jams.get_active_jam_id()
        self.timer.call_timeout(timestamp, period_num, jam_num)

    def end_timeout(self, timestamp: datetime) -> None:
        self.timer.end_timeout(timestamp)
