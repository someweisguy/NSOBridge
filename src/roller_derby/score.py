from __future__ import annotations
from dataclasses import dataclass
from datetime import datetime
from .encodable import Encodable
from .series import JamTeam
from typing import Any


class Score(Encodable):
    @dataclass
    class Trip(Encodable):
        points: int
        timestamp: datetime

        def encode(self) -> dict[str, Any]:
            return {"points": self.points, "timestamp": str(self.timestamp)}

    def __init__(self, parent: JamTeam) -> None:
        super().__init__()
        self._parent: JamTeam = parent
        self.trips: list[Score.Trip] = []
        self.lead: bool = False
        self.lost: bool = False
        self.starPass: None | int = None

    def encode(self) -> dict[str, Any]:
        return {
            "trips": [trip.encode() for trip in self.trips],
            "lead": self.lead,
            "lost": self.lost,
            "starPass": self.starPass,
        }
