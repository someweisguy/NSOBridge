from typing import Final

from clock import TimeKeeper
from score import ScoreKeeper

class Ruleset:
    def __init__(self, time: TimeKeeper, scorekeeper: ScoreKeeper) -> None:
        self.time: Final[TimeKeeper] = time
        self.score: Final[ScoreKeeper] = scorekeeper
