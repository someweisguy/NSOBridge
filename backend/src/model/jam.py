from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import ClassVar, Final, Literal

from backend.src.model.bout import AbstractReferee, JamId

from model.team import TeamAttribute, TeamString

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

    def get_jam_score(self, team: TeamString) -> int:
        score: Score = self[team].score
        return sum([trip.points for trip in score.trips])

    def add_trip(
        self,
        team: TeamString,
        points: int,
        timestamp: datetime,
        valid_pass: bool = True,
    ) -> None:
        self[team].score.trips.append(Score.Trip(points, timestamp))

    def del_trip(self, team: TeamString, trip_num: int) -> None:
        del self[team].score.trips[trip_num]

    def edit_trip(
        self,
        team: TeamString,
        trip_num: int,
        points: int | None,
    ) -> None:
        trip: Score.Trip = self[team].score.trips[trip_num]
        if points is not None:
            trip.points = points

    def set_lead(self, team: TeamString, value: bool) -> None:
        if value is True and self.lead_is_declared():
            raise RuntimeError('A Lead Jammer has already been declared') from None
        self[team].score.lead = value

    def set_lost(self, team: TeamString, value: bool) -> None:
        self[team].score.lost = value

    def set_star_pass(self, team: TeamString, value: int | None) -> None:
        self[team].score.star_pass = value

    def set_stop_reason(self, value: StopReason) -> None:
        if self.stop_timestamp is not None:
            raise RuntimeError('This Jam is still running') from None
        self.stop_reason = value


@dataclass(slots=True)
class JamReferee(AbstractReferee):
    JAM_DURATION: ClassVar[Final[timedelta]] = timedelta(minutes=2)

    jams: Final[tuple[list[Jam], list[Jam]]] = field(init=False, default=([Jam()], []))

    def __getitem__(self, jam_id: JamId) -> Jam:
        period_num, jam_num = jam_id
        return self.jams[period_num][jam_num]

    def get_jam(self, jam_id: JamId) -> Jam:
        return self[jam_id]

    def get_latest_jam_id(self) -> JamId:
        period_num: int = 1 if len(self.jams[1]) > 0 else 0
        jam_num: int = len(self.jams[period_num]) - 1
        return (period_num, jam_num)

    def get_active_jam_id(self) -> JamId | None:
        period_num, jam_num = self.get_latest_jam_id()
        if self[period_num, jam_num].start_timestamp is None:
            if jam_num < 1:
                return None  # There is no active Jam
            jam_num -= 1
        return (period_num, jam_num)

    def get_total_score(self, team: TeamString) -> int:
        all_jams: list[Jam] = [jam for period in self.jams for jam in period]
        return sum(jam.get_jam_score(team) for jam in all_jams)

    def start_jam(self, timestamp: datetime) -> None:
        jam: Jam = self.get_jam(self.get_latest_jam_id())
        jam.start_timestamp = timestamp

    def stop_jam(self, timestamp: datetime) -> None:
        active_jam_id: JamId = self.get_active_jam_id()
        if active_jam_id is None or self.get_jam(active_jam_id).start_timestamp is None:
            raise RuntimeError('There is no running Jam to stop')

        jam: Jam = self.get_jam(active_jam_id)
        jam.stop_timestamp = timestamp

        # Guess the reason that the Jam is being stopped
        if jam.lead_is_declared():
            jam.stop_reason = 'called'
        elif timestamp - jam.start_timestamp >= self.JAM_DURATION:
            jam.stop_reason = 'time'
        else:
            jam.stop_reason = None

        # Add a new Jam
        period_num, _ = active_jam_id
        self.jams[period_num].append(Jam())

    def add_trip(
        self, jam_id: JamId, team: TeamString, points: int, valid_pass: bool = True
    ) -> None:
        now: datetime = datetime.now()

        jam: Jam = self.get_jam(jam_id)
        jam.add_trip(team, points, now, valid_pass)

        # Declare a Lead Jammer if it is appropriate
        if all(valid_pass, not jam[team].score.lost, not jam.lead_is_declared()):
            jam.set_lead(team, True)

    def set_trip(
        self, jam_id: JamId, team: TeamString, trip_num: int, points: int
    ) -> None:
        jam: Jam = self.get_jam(jam_id)
        jam[team].score.trips[trip_num].points = points

    def delete_trip(self, jam_id: JamId, team: TeamString, trip_num: int) -> None:
        jam: Jam = self.get_jam(jam_id)
        del jam[team].score.trips[trip_num]

    def set_lead(self, jam_id: JamId, team: TeamString, value: bool) -> None:
        jam: Jam = self.get_jam(jam_id)
        jam[team].score.lead = value

    def set_lost(self, jam_id: JamId, team: TeamString, value: bool) -> None:
        jam: Jam = self.get_jam(jam_id)
        jam[team].score.lost = value

    def set_star_pass(self, jam_id: JamId, team: TeamString, value: int | None) -> None:
        jam: Jam = self.get_jam(jam_id)
        jam[team].score.star_pass = value

        # Automatically set Lost Lead on Star Pass
        if value is not None:
            self.set_lost(jam_id, team, True)

    def set_stop_reason(self, jam_id: JamId, stop_reason: StopReason | None) -> None:
        jam: Jam = self.get_jam(jam_id)
        jam.stop_reason = stop_reason
