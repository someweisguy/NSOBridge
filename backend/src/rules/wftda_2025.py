from datetime import datetime

from models.bout import BoutModel
from models.jam import JamModel
from rules.rules import Referee


class WFTDA_2025_Referee(Referee):
    async def start_jam(self, bout: BoutModel):
        now: datetime = datetime.now()

        bout.jams[-1].start(now)
        if not bout.clock.is_running():
            bout.clock.start(now)

    async def stop_jam(self, bout: BoutModel):
        now: datetime = datetime.now()

        bout.jams[-1].stop(now)
        jam: JamModel = bout.add_jam()
        jam.assign_teams(*bout.teams)
