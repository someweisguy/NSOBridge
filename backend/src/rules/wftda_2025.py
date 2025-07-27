from datetime import datetime
from typing import Final

from models import BoutModel, JamModel
from models.bout import TimeoutModel
from models.jam import TeamJamModel, TeamName
from rules.rules import AbstractReferee

MAX_PASSES_PER_TRIP: Final[int] = 4

class WFTDA2025Referee(AbstractReferee):
    async def add_trip(self, jam: JamModel, team: TeamName, passes: int) -> None:
        now: datetime = datetime.now()
        if 0 > passes > MAX_PASSES_PER_TRIP:
            raise ValueError(f'Number of passes must be 4 or less ({passes=})')
        
        num_trips: int = len(jam[team].trips)

        # Set Lead Jammer on initial Trip
        if passes > 0 and num_trips == 0 and not jam.lead_is_declared():
            await self.set_lead(jam, team, True)

        # The initial Trip should always be set to 0 Passes
        jam[team].add_trip(passes if num_trips > 0 else 0, now)

    async def get_score(self, bout: BoutModel) -> tuple[int, ...]:
        return tuple(
            sum(
                trip.passes
                for team_jam in team.team_jams
                for trip in team_jam.trips[1:]  # The first Trip is ignored
            )
            for team in bout.teams
        )

    async def set_lead(self, jam: JamModel, team: TeamName, lead: bool) -> None:
        if lead and jam.lead_is_declared():
            raise RuntimeError('A Lead Jammer has already been declared')
        team_jam: TeamJamModel | None = jam[team]
        assert team_jam is not None
        jam[team].lead = lead

    async def set_lost(self, jam: JamModel, team: TeamName, lost: bool) -> None:
        jam[team].lost = lost

    async def set_star_pass(
        self, jam: JamModel, team: TeamName, star_pass: bool
    ) -> None:
        if star_pass:
            pass
        else:
            jam[team].star_pass_trip = None

    async def start_jam(self, bout: BoutModel):
        now: datetime = datetime.now()

        if len(bout.timeouts) > 0 and bout.timeouts[-1].is_running():
            raise RuntimeError('Cannot start a Jam during a Timeout')

        bout.jams[-1].start(now)
        if not bout.clock.is_running():
            bout.clock.start(now)

    async def stop_jam(self, bout: BoutModel):
        now: datetime = datetime.now()

        bout.jams[-1].stop(now)
        jam: JamModel = bout.add_jam()
        jam.assign_teams(*bout.teams[:2])

    async def start_timeout(self, bout: BoutModel) -> None:
        now: datetime = datetime.now()

        if len(bout.jams) == 0:
            raise RuntimeError('Cannot start a Timeout until the Bout has started')
        elif bout.jams[-1].is_running():
            raise RuntimeError('Cannot start a Timeout during a Jam')

        bout.call_timeout(now)

    async def stop_timeout(self, bout: BoutModel) -> None:
        now: datetime = datetime.now()

        if len(bout.timeouts) == 0 or not bout.timeouts[-1].is_running():
            raise RuntimeError('Cannot stop a Timeout if one is not already running')
        timeout: TimeoutModel = bout.timeouts[-1]

        # TODO: Enforce TimeoutModel rules here

        timeout.stop(now)

        # Decrement the Timeout or Official Review if it was not retained
        if timeout.team is not None and not timeout.retained:
            if timeout.is_review:
                timeout.team.reviews_remaining -= 1
            else:
                timeout.team.timeouts_remaining -= 1
