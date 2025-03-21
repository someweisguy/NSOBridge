from __future__ import annotations

from typing import Protocol
from uuid import UUID

import model
from model import BoutState

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
