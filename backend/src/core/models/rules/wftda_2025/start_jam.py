from datetime import datetime

from core.models.game.bout import SQLBout
from core.models.rules.referees import AbstractRule


class StartJam(AbstractRule):
    def __call__(self, bout: SQLBout):
        now: datetime = datetime.now()

        bout.jams[-1].start(now)
        if not bout.clock.is_running():
            bout.clock.start(now)
