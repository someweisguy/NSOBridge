from datetime import datetime

from models.bout import SQLBout
from models.jam import SQLJam
from rules.referees import Referee


class WFTDA_2025_Referee(Referee):
    async def start_jam(self, bout: SQLBout):
        now: datetime = datetime.now()

        bout.jams[-1].start(now)
        if not bout.clock.is_running():
            bout.clock.start(now)

    async def stop_jam(self, bout: SQLBout):
        now: datetime = datetime.now()

        bout.jams[-1].stop(now)
        jam: SQLJam = bout.add_jam()
        jam.assign_teams(*bout.teams)
