from datetime import datetime

from core.models.game.bout import SQLBout
from core.models.game.jam import SQLJam
from core.models.rules.referees import Referee


class WFTDA_2025_Referee(Referee):
    async def start_jam(self, bout: SQLBout):
        now: datetime = datetime.now()
        print(f'!!!!!!!!!!!!!!!!!!!!!!!!  Starting Jam at {now}')

        bout.jams[-1].start(now)
        if not bout.clock.is_running():
            bout.clock.start(now)

    async def stop_jam(self, bout: SQLBout):
        now: datetime = datetime.now()

        bout.jams[-1].stop(now)
        jam: SQLJam = bout.add_jam()
        jam.assign_teams(*bout.teams)
