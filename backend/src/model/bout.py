from datetime import datetime

from pydantic import ConfigDict, Field, computed_field

from model.context import RefereeContext
from model.referee.jam import JamReferee
from model.referee.timer import TimeReferee
from model.team import Team, TeamAttribute


class Bout(RefereeContext):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    ruleset_name: str = Field(init=False, final=True)
    timer: TimeReferee = Field(exclude=True)
    jam_ref: JamReferee = Field(exclude=True)

    def __init__(self, ruleset_name: str) -> None:
        super().__init__(
            ruleset_name=ruleset_name,
            home=Team(),
            away=Team(),
            timer=TimeReferee(self),
            jam_ref=JamReferee(self),
        )

    @computed_field()
    def num_jams(self) -> tuple[int, int]:
        return self.jam_ref.get_lens()

    @computed_field()
    def total_score(self) -> TeamAttribute[int]:
        return TeamAttribute[int](
            home=self.jam_ref.get_total_score('home'),
            away=self.jam_ref.get_total_score('away'),
        )

    def start_jam(self, timestamp: datetime) -> None:
        self.timer.start_jam(timestamp)
        self.jam_ref.start_jam(timestamp)

    def stop_jam(self, timestamp: datetime) -> None:
        self.timer.stop_jam(timestamp)
        self.jam_ref.stop_jam(timestamp)

    def call_timeout(self, timestamp: datetime) -> None:
        period_num, jam_num = self.jam_ref.get_active_jam_id()
        self.timer.call_timeout(timestamp, period_num, jam_num)

    def end_timeout(self, timestamp: datetime) -> None:
        self.timer.end_timeout(timestamp)
