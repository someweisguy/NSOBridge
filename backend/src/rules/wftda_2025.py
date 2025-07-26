from datetime import datetime

from models import BoutModel, JamModel
from models.bout import TimeoutModel
from rules.rules import AbstractReferee


class WFTDA2025Referee(AbstractReferee):
    async def get_score(self, bout: BoutModel) -> tuple[int, ...]:
        return tuple(
            sum(trip.passes for team_jam in team.team_jams for trip in team_jam.trips)
            for team in bout.teams
        )

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
        
