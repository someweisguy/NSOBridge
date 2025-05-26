from abc import ABC
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Callable, Final

from model.jam import JamReferee
from model.team import RefereeContext
from model.timer import TimeReferee

type JamId = tuple[int, int]


@dataclass(slots=True)
class AbstractReferee(ABC):
    context: Final[RefereeContext]
    _set_callback: Callable[[str, Any, Any], None] | None = None
    
    def on_update(self, callback: Callable[[str, Any, Any], None]) -> None:
        self._set_callback = callback
        
    def update_manually(self, name: str = '') -> None:
        self._set_callback(name, None, None)
    
    def __setattr__(self, name, value):
        if self._set_callback is not None:
            old_value: Any = self.__getattribute__(name)
            self._set_callback(name, old_value, value)
        return super().__setattr__(name, value)


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
