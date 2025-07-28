from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, Final

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.jam import JamModel, StarPassModel, TeamJamModel, TeamName, TripModel
from models.models import SQLModel
from models.time import ClockModel, TimeoutModel

if TYPE_CHECKING:
    from models.team import TeamModel

MAX_POINTS_PER_TRIP: Final[int] = 4


class BoutModel(SQLModel):
    __tablename__ = 'bouts'
    _clock_id: Mapped[int] = mapped_column(
        ForeignKey('clocks._id', ondelete='RESTRICT'), init=False
    )

    ruleset: Mapped[str] = mapped_column()

    teams: Mapped[list[TeamModel]] = relationship(init=False, lazy='selectin')
    clock: Mapped[ClockModel] = relationship(foreign_keys=[_clock_id], lazy='joined')
    timeouts: Mapped[list[TimeoutModel]] = relationship(init=False, lazy='selectin')
    jams: Mapped[list[JamModel]] = relationship(
        init=False,
        lazy='selectin',
        load_on_pending=True,
        order_by=[JamModel.period, JamModel.jam],
    )

    __mapper_args__ = {
        'polymorphic_identity': 'WFTDA 2025',
        'polymorphic_on': 'ruleset',
    }

    @staticmethod
    def fetch_team_bout_score(team: TeamModel) -> int:
        # Sum the Trip passes, ignoring the first Trip
        return sum(
            trip.passes for team_jam in team.team_jams for trip in team_jam.trips[1:]
        )

    @staticmethod
    def fetch_team_jam_score(team: TeamModel) -> int:
        if len(team.team_jams) == 0:
            return 0
        team_jam: TeamJamModel = team.team_jams[-1]
        return sum(trip.passes for trip in team_jam.trips)

    def ready(self) -> None:
        if len(self.jams) > 0:
            raise RuntimeError('This Bout has already been setup')
        self.jams.append(
            JamModel(
                period=0,
                jam=0,
                home=TeamJamModel(team=self.teams[0]),
                away=TeamJamModel(team=self.teams[1]),
            )
        )
        
    def pause(self) -> None:
        pass

    def start_jam(self, timestamp: datetime) -> JamModel:
        if len(self.timeouts) > 0 and self.timeouts[-1].is_running():
            raise RuntimeError('Cannot start a Jam during a Timeout')

        self.jams[-1].start(timestamp)
        if not self.clock.is_running():
            self.clock.start(timestamp)
        return self.jams[-1]

    def stop_jam(self, timestamp: datetime) -> None:
        self.jams[-1].stop(timestamp)

        latest: JamModel = self.jams[-1]
        self.jams.append(
            JamModel(
                period=latest.period,
                jam=latest.jam,
                home=TeamJamModel(team=self.teams[0]),
                away=TeamJamModel(team=self.teams[1]),
            )
        )

    def add_trip(self, team: TeamName, passes: int, timestamp: datetime) -> None:
        if 0 > passes > MAX_POINTS_PER_TRIP:
            raise ValueError(
                f'Number of passes must be {MAX_POINTS_PER_TRIP} or less ({passes=})'
            )
        if len(self.jams) == 0:
            raise RuntimeError('Cannot add a Trip to a Bout that has not been setup')
        jam: JamModel = self.jams[-1]
        if not jam.is_running():
            raise RuntimeError('There is no running Jam to which to add a Trip')

        if passes > 0 and not jam.lead_is_declared():
            self.set_lead(team, True, timestamp)  # Set Lead on first legal Trip
        if len(jam[team].trips) == 0:
            passes = 0  # The initial Trip should always be set to 0 passes

        jam[team].trips.append(TripModel(timestamp=timestamp, passes=passes))

    def set_lead(self, team: TeamName, lead: bool, timestamp: datetime) -> None:
        if len(self.jams) == 0:
            raise RuntimeError('Cannot set Lead on a Bout that has not been setup')
        jam: JamModel = self.jams[-1]
        if not jam.is_running():
            raise RuntimeError('There is no running Jam to which to set Lead')
        if lead and jam.lead_is_declared():
            raise RuntimeError('A Lead Jammer has already been declared in this Jam')

        jam[team].lead = timestamp if lead else None

    def set_lost(self, team: TeamName, lost: bool) -> None:
        if len(self.jams) == 0:
            raise RuntimeError('Cannot set Lost on a Bout that has not been setup')
        jam: JamModel = self.jams[-1]
        if not jam.is_running():
            raise RuntimeError('There is no running Jam to which to set Lost')

        jam[team].lost = lost

    def set_star_pass(self, team: TeamName, timestamp: datetime) -> None:
        if len(self.jams) == 0:
            raise RuntimeError('Cannot set Star Pass on a Bout that has not been setup')
        jam: JamModel = self.jams[-1]
        if not jam.is_running():
            raise RuntimeError('There is no running Jam to which to set Star Pass')

        star_pass: StarPassModel = StarPassModel(
            timestamp=timestamp,
            trip=jam[team].trips[-1] if len(jam[team].trips) > 0 else None,
        )
        jam[team].star_passes.append(star_pass)

    def start_timeout(self, timestamp: datetime) -> TimeoutModel:
        if len(self.jams) == 0:
            raise RuntimeError(
                'Cannot start a Timeout on a Bout that has not been setup'
            )
        if self.jams[-1].is_running():
            raise RuntimeError('Cannot start a Timeout when a Jam is running')

        # Timeouts are recorded on the latest running Jam
        latest: JamModel = self.jams[-2]
        timeout: TimeoutModel = TimeoutModel(
            period=latest.period,
            jam=latest.jam,
            start_timestamp=timestamp,
            clock_elapsed=self.clock.get_duration(timestamp),
        )
        self.timeouts.append(timeout)
        return timeout

    def stop_timeout(self, timestamp: datetime) -> None:
        if len(self.timeouts) == 0 or not self.timeouts[-1].is_running():
            raise RuntimeError('Cannot stop a Timeout if one is not already running')
        timeout: TimeoutModel = self.timeouts[-1]

        # TODO: Enforce TimeoutModel rules here

        timeout.stop(timestamp)

        # Decrement the Timeout or Official Review if it was not retained
        if timeout.team is not None and not timeout.retained:
            if timeout.is_review:
                timeout.team.reviews_remaining -= 1
            else:
                timeout.team.timeouts_remaining -= 1
