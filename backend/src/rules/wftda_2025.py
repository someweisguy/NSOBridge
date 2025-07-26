from datetime import datetime

from models import BoutModel, JamModel
from rules.rules import AbstractReferee


class WFTDA2025Referee(AbstractReferee):
    async def get_score(self, bout: BoutModel) -> tuple[int, ...]:
        return tuple(
            sum(trip.passes for team_jam in team.team_jams for trip in team_jam.trips)
            for team in bout.teams
        )

    async def start_jam(self, bout: BoutModel):
        now: datetime = datetime.now()

        bout.jams[-1].start(now)
        if not bout.clock.is_running():
            bout.clock.start(now)

    async def stop_jam(self, bout: BoutModel):
        now: datetime = datetime.now()

        bout.jams[-1].stop(now)
        jam: JamModel = bout.add_jam()
        jam.assign_teams(*bout.teams[:2])
