from datetime import datetime, timedelta
from typing import ClassVar

from core.models import Gettable, ProjectModel
from core.models.bout.bout import Bout
from core.models.bout.jam import Jam


class StopJam(ProjectModel):
    JAM_DURATION: ClassVar[timedelta] = timedelta(minutes=2)

    def __call__(self, bout: Bout, timestamp: datetime) -> tuple[Gettable, ...]:
        if not bout.clocks.jam.is_running():
            raise RuntimeError('Cannot stop a Jam when there is none running')
        jam: Jam | None = bout.get_active_jam()
        if jam is None or not jam.is_running():
            raise RuntimeError('There is no running Jam to stop')

        # Update clocks
        bout.clocks.jam.stop(timestamp)
        bout.clocks.lineup.reset()
        bout.clocks.lineup.start(timestamp)

        # End the current Jam
        bout.end_jam(timestamp)

        # Guess the reason that the Jam is being stopped
        if jam.lead_is_declared():
            jam.stop_reason = 'called'
        elif jam.get_duration() >= self.JAM_DURATION:
            jam.stop_reason = 'time'
        else:
            jam.stop_reason = None

        # Assign teams to the Jam
        bout.get_latest_jam().assign_teams(bout.teams)

        return bout, jam, bout.get_latest_jam()
