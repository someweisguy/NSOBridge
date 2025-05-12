from dataclasses import dataclass, field
from datetime import datetime
from typing import Final, Literal

from .protocols import TeamAttribute, TeamType

type StopReason = Literal['called', 'time', 'injury', 'other']


@dataclass(slots=True)
class Score:
    @dataclass(slots=True)
    class Trip:
        points: int
        timestamp: datetime

    lead: bool = False
    lost: bool = False
    star_pass: int | None = None
    trips: Final[list[Trip]] = field(default_factory=list)


@dataclass(slots=True)
class Team:
    score: Final[Score] = field(default_factory=Score)


@dataclass(slots=True)
class Jam(TeamAttribute[Team]):
    start_timestamp: datetime | None = None
    stop_timestamp: datetime | None = None
    stop_reason: StopReason | None = None
    home: Final[Team] = field(default_factory=Team)  # type: ignore[assignment]
    away: Final[Team] = field(default_factory=Team)  # type: ignore[assignment]

    def lead_is_declared(self) -> bool:
        return self.home.score.lead or self.away.score.lead

    def get_jam_score(self, team: TeamType) -> int:
        score: Score = self[team].score
        return sum([trip.points for trip in score.trips])

    def add_trip(
        self, team: TeamType, points: int, timestamp: datetime, valid_pass: bool = True
    ) -> None:
        self[team].score.trips.append(Score.Trip(points, timestamp))

    def del_trip(self, team: TeamType, trip_num: int) -> None:
        del self[team].score.trips[trip_num]

    def edit_trip(
        self,
        team: TeamType,
        trip_num: int,
        points: int | None,
        timestamp: datetime | None = None,
    ) -> None:
        trip: Score.Trip = self[team].score.trips[trip_num]
        if points is not None:
            trip.points = points
        if timestamp is not None:
            trip.timestamp = timestamp

    def set_lead(self, team: TeamType, value: bool) -> None:
        if value is True and self.lead_is_declared():
            raise RuntimeError('A Lead Jammer has already been declared') from None
        self[team].score.lead = value

    def set_lost(self, team: TeamType, value: bool) -> None:
        self[team].score.lost = value

    def set_star_pass(self, team: TeamType, value: int | None) -> None:
        self[team].score.star_pass = value

    def set_stop_reason(self, value: StopReason) -> None:
        if self.stop_timestamp is not None:
            raise RuntimeError('This Jam is still running') from None
        self.stop_reason = value