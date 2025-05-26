from dataclasses import dataclass
from datetime import datetime
from typing import Final

from model.jam import JamReferee
from model.team import RefereeContext
from model.timer import TimeReferee


@dataclass(slots=True)
class Bout(RefereeContext):
    ruleset_name: Final[str]
    timer: Final[TimeReferee]
    jams: Final[JamReferee]
    
    def __init__(self, ruleset_name: str) -> None:
        self.ruleset_name = ruleset_name
        self.timer = TimeReferee(self)
        self.jams = JamReferee(self)

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
