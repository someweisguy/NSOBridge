from __future__ import annotations

from datetime import datetime
from typing import Final

from models.bout import GenericBoutModel
from models.jam import JamModel, StarPassModel, TeamJamModel, TeamName, TripModel
from models.time import TimeoutModel

MAX_POINTS_PER_TRIP: Final[int] = 4


class BoutModel(GenericBoutModel):
    __mapper_args__ = {
        'polymorphic_identity': 'WFTDA 2025',
    }

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
