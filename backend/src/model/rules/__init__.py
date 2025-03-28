from __future__ import annotations

from typing import Final

from .score import ScoreKeeper
from .time import TimeKeeper


class Ruleset:
    def __init__(self, time: TimeKeeper, score: ScoreKeeper) -> None:
        self.time: Final[TimeKeeper] = time
        self.score: Final[ScoreKeeper] = score
