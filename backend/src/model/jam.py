from datetime import datetime, timedelta
from typing import ClassVar, Literal

from pydantic import BaseModel, Field

from model.team import AbstractReferee, TeamAttribute, TeamString
from model.timer import Timer

type JamId = tuple[int, int]
type StopReason = Literal['called', 'time', 'injury', 'other']


class Score(BaseModel):
    class Trip(BaseModel):
        points: int
        timestamp: datetime

    lead: bool = False
    lost: bool = False
    star_pass: int | None = None
    trips: list[Trip] = Field([], final=True)


class TeamJam(BaseModel):
    score: Score = Field(Score(), final=True)


class Jam(TeamAttribute[TeamJam], Timer):
    stop_reason: StopReason | None = None
    
    def __init__(self) -> None:
        super().__init__(home=TeamJam(), away=TeamJam())

    def lead_is_declared(self) -> bool:
        return self.home.score.lead or self.away.score.lead

    def get_jam_score(self, team: TeamString) -> int:
        score: Score = self[team].score
        return sum([trip.points for trip in score.trips])


class JamReferee(AbstractReferee):
    JAM_DURATION: ClassVar[timedelta] = timedelta(minutes=2)

    periods: tuple[list[Jam], list[Jam]] = Field(([Jam()], []), final=True)

    def __getitem__(self, jam_id: JamId) -> Jam:
        return self.get_jam(jam_id)

    def __len__(self) -> tuple[int, int]:
        return self.get_lens()

    def get_jam(self, jam_id: JamId) -> Jam:
        period_num, jam_num = jam_id
        return self.periods[period_num][jam_num]

    def get_lens(self) -> tuple[int, int]:
        return (len(self.periods[0]), len(self.periods[1]))

    def get_latest_jam_id(self) -> JamId:
        period_num: int = 1 if len(self.periods[1]) > 0 else 0
        jam_num: int = len(self.periods[period_num]) - 1
        return (period_num, jam_num)

    def get_active_jam_id(self) -> JamId | None:
        period_num, jam_num = self.get_latest_jam_id()
        if self[period_num, jam_num].start_timestamp is None:
            if jam_num < 1:
                return None  # There is no active Jam
            jam_num -= 1
        return (period_num, jam_num)

    def get_total_score(self, team: TeamString) -> int:
        all_jams: list[Jam] = [jam for period in self.periods for jam in period]
        return sum(jam.get_jam_score(team) for jam in all_jams)

    def start_jam(self, timestamp: datetime) -> None:
        jam: Jam = self.get_jam(self.get_latest_jam_id())
        jam.start_timestamp = timestamp

    def stop_jam(self, timestamp: datetime) -> None:
        active_jam_id: JamId = self.get_active_jam_id()
        if active_jam_id is None or self.get_jam(active_jam_id).start_timestamp is None:
            raise RuntimeError('There is no running Jam to stop')

        jam: Jam = self.get_jam(active_jam_id)
        jam.elapsed = timestamp - jam.start_timestamp

        # Guess the reason that the Jam is being stopped
        if jam.lead_is_declared():
            jam.stop_reason = 'called'
        elif jam.elapsed >= self.JAM_DURATION:
            jam.stop_reason = 'time'
        else:
            jam.stop_reason = None

        # Add a new Jam
        period_num, _ = active_jam_id
        self.periods[period_num].append(Jam())

    def add_trip(
        self, jam_id: JamId, team: TeamString, points: int, valid_pass: bool = True
    ) -> None:
        now: datetime = datetime.now()

        jam: Jam = self.get_jam(jam_id)
        jam[team].score.trips.append(Score.Trip(points, now))

        # Declare a Lead Jammer if it is appropriate
        if all([valid_pass, not jam[team].score.lost, not jam.lead_is_declared()]):
            self.set_lead(jam_id, team, True)

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
