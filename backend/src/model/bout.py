from datetime import datetime
from typing import Any

from pydantic import Field, PrivateAttr, computed_field

from model.jam import JamReferee
from model.team import RefereeContext, Team
from model.timer import TimeReferee


class Bout(RefereeContext):
    ruleset_name: str = Field(init=False, final=True)
    timer: TimeReferee = Field(init=False, final=True)
    _jams: JamReferee = PrivateAttr()

    def __init__(self, ruleset_name: str) -> None:
        timer = TimeReferee(_context=self)
        super().__init__(
            ruleset_name=ruleset_name, timer=timer, home=Team(), away=Team()
        )

    def model_post_init(self, context: Any) -> None:
        self._jams = JamReferee(_context=self)

    @property
    def jams(self) -> JamReferee:
        return self._jams

    @computed_field()
    def num_jams(self) -> tuple[int, int]:
        return self.jams.get_lens()

    def start_jam(self, timestamp: datetime) -> None:
        self.timer.start_jam(timestamp)
        self.jams.start_jam(timestamp)

    def stop_jam(self, timestamp: datetime) -> None:
        self.timer.stop_jam(timestamp)
        self.jams.stop_jam(timestamp)

    def call_timeout(self, timestamp: datetime) -> None:
        self.timer.call_timeout(timestamp)

    def end_timeout(self, timestamp: datetime) -> None:
        self.timer.end_timeout(timestamp)
