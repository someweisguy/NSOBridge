from __future__ import annotations

from .score import ScoreKeeper
from .time import TimeKeeper


class Ruleset:
    def __init__(self, time: TimeKeeper, score: ScoreKeeper) -> None:
        self._time: TimeKeeper = time
        self._score: ScoreKeeper = score

    @property
    def time(self) -> TimeKeeper:
        return self._time

    @property
    def score(self) -> ScoreKeeper:
        return self._score
