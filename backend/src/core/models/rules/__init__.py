from __future__ import annotations

from dataclasses import dataclass
from typing import Annotated, Final, Iterable, Protocol

from fastapi import Depends

from core.models.bout import Bout, bouts


class Rule(Protocol):
    def execute(self) -> None: ...
    def get_update_keys(self) -> Iterable: ...  # TODO: define keytype


@dataclass(frozen=True, kw_only=True, slots=True)
class BoutTimer(Protocol):
    start_jam: type[Rule]
    stop_jam: type[Rule]
    call_timeout: type[Rule]
    end_timeout: type[Rule]
    end_period: type[Rule]


@dataclass(frozen=True, slots=True)
class Ruleset(Protocol):
    bout_timer: BoutTimer
    # TODO: jam_referee: JamReferee


def _ruleset_depends(bout_id: str) -> Ruleset:
    bout: Bout = bouts[bout_id]
    return RULESETS[bout.ruleset_name]


RulesetDepend = Annotated[Ruleset, Depends(_ruleset_depends)]


RULESETS: Final[dict[str, Ruleset]] = {'WFTDA 2025': Ruleset(BoutTimer)}
