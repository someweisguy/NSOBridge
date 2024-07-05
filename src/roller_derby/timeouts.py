from __future__ import annotations
from datetime import datetime
from .teamAttribute import AbstractAttribute, TeamAttribute
from .timer import Timer
from typing import Any, Literal, Self
import bout
import server


class ClockStoppage(AbstractAttribute):
    API_NAME: str = "timeout"

    def __init__(self, parent: TeamAttribute[bout.Bout, Self]) -> None:
        super().__init__(parent)
        self._timeouts: int = 3
        self._officialReviews: int = 1

    @property
    def timeouts(self) -> int:
        return self._timeouts

    @timeouts.setter
    def timeouts(self, value: int) -> None:
        if not isinstance(value, int):
            raise TypeError(f"timeouts must be of type int not {type(value).__name__}")
        if value < 0:
            raise ValueError("a Team cannot have fewer than 0 timeouts")
        self._timeouts = value

    @property
    def officialReviews(self) -> int:
        return self._officialReviews

    @officialReviews.setter
    def officialReviews(self, value: int) -> None:
        if not isinstance(value, int):
            raise TypeError(
                f"officalReviews must be of type int not {type(value).__name__}"
            )
        if value < 0:
            raise ValueError("a Team cannot have fewer than 0 Official Reviews")
        self._officialReviews = value

    def timeout(self) -> None:
        if self._timeouts <= 0:
            raise RuntimeError("this team does not have any remaining Timeouts")
        self._timeouts -= 1

    def officialReview(self) -> None:
        if self._officialReviews <= 0:
            raise RuntimeError("this team does not have any remaining Official Reviews")
        self._officialReviews -= 1

    def encode(self) -> dict[str, Any]:
        return {
            "team": self.getTeam(),
            "timeouts": self._timeouts,
            "officialReviews": self._officialReviews,
        }


class TeamClockStoppage(TeamAttribute[bout.Bout, ClockStoppage]):
    API_NAME: str = "clockStoppage"
    SOURCES = Literal["official"] | bout.Jam.TEAMS

    def __init__(self, parent: bout.Bout, cls: type[ClockStoppage]) -> None:
        super().__init__(parent, cls)
        self._timeout: Timer = Timer()
        self._source: None | TeamClockStoppage.SOURCES = None
        self._isTimeout: None | bool = None

    def call(self, timestamp: datetime) -> None:
        if self._timeout.isRunning():
            raise RuntimeError("the Period clock is already stopped")
        self._timeout.start(timestamp, lambda _: server.update(self))
        server.update(self)

    def assignTimeout(self, source: TeamClockStoppage.SOURCES) -> None:
        if not self._timeout.isRunning():
            raise RuntimeError("there is not a Clock Stoppage currently ongoing")
        if source != "official":
            self[source].timeout()
        self._source = source
        self._isTimeout = True
        server.update(self)

    def assignOfficialReview(self, source: bout.Jam.TEAMS) -> None:
        if not self._timeout.isRunning():
            raise RuntimeError("there is not a Clock Stoppage currently ongoing")
        self[source].officialReview()
        self._source = source
        self._isTimeout = False
