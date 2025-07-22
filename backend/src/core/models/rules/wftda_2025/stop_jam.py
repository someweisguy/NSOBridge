from datetime import datetime

from core.models.game.bout import SQLBout
from core.models.game.jam import SQLJam
from core.models.rules.referees import AbstractRule


class StopJam(AbstractRule):
    async def __call__(self, bout: SQLBout):
        now: datetime = datetime.now()

        bout.jams[-1].stop(now)
        jam: SQLJam = bout.add_jam()
        jam.assign_teams(*bout.teams)
