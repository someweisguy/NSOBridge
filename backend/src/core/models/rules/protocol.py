from dataclasses import dataclass
from typing import Iterable, Protocol


class Rule(Protocol):
    def execute(self) -> None: ...
    def get_update_keys(self) -> Iterable: ...  # TODO: define keytype


@dataclass(frozen=True, kw_only=True, slots=True)
class Ruleset:
    start_jam: type[Rule]
    stop_jam: type[Rule]
    call_timeout: type[Rule]
    end_timeout: type[Rule]
    end_period: type[Rule]
    # TODO: jam_referee: JamReferee
