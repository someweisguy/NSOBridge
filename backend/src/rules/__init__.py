from __future__ import annotations

from typing import Final

from .score import ScoreKeeper
from .time import TimeKeeper


class Ruleset:
    RULESETS: Final[dict[str, Ruleset]] = {}

    def __init__(self, name: str, time: TimeKeeper, score: ScoreKeeper) -> None:
        if name in self.RULESETS:
            raise ValueError(f"Ruleset {name} already exists")
        self.RULESETS[name] = self
        self.time: Final[TimeKeeper] = time
        self.score: Final[ScoreKeeper] = score


def get_ruleset(name: str) -> Ruleset:
    return Ruleset.RULESETS[name]


# Instantiate the default ruleset
Ruleset("WFTDA 2025", TimeKeeper(), ScoreKeeper())
