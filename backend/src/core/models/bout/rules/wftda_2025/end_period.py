from datetime import datetime
from typing import ClassVar

from core.models import Gettable, ProjectModel
from core.models.bout.bout import Bout
from core.models.bout.jam import Jam
from core.models.time.alarm import Alarm


class EndPeriod(ProjectModel):
    MAX_NUM_PERIODS: ClassVar[int] = 3

    def __call__(self, bout: Bout, timestamp: datetime) -> tuple[Gettable, ...]:
        # Stop the clocks
        for clock in dict[str, Alarm](bout.clocks).values():
            if clock.is_running():
                clock.stop(timestamp)
        bout.clocks.jam.reset()

        # End the Period or finalize the Bout
        if len(bout.num_jams) < self.MAX_NUM_PERIODS:
            bout.end_period()
            latest_jam: Jam = bout.get_latest_jam()
            latest_jam.assign_teams(bout.teams)
        else:
            bout.is_final = True

        return (bout,)
