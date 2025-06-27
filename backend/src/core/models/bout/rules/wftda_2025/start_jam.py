from datetime import datetime

from core.models import Gettable, ProjectModel
from core.models.bout.bout import Bout
from core.models.bout.jam import Jam


class StartJam(ProjectModel):
    def __call__(self, bout: Bout, timestamp: datetime) -> tuple[Gettable, ...]:
        if bout.clocks.jam.is_running():
            raise RuntimeError('A Jam cannot be started when one is already running')
        if bout.is_in_timeout():
            raise RuntimeError('Cannot start a Jam when a Timeout is running')

        # Update clocks
        for clock in [bout.clocks.intermission, bout.clocks.lineup]:
            if clock.is_running():
                clock.stop(timestamp)
        if not bout.clocks.game.is_running():
            bout.clocks.game.start(timestamp)
        bout.clocks.jam.reset()
        bout.clocks.jam.start(timestamp)

        # Set Jam data
        latest_jam: Jam = bout.get_latest_jam()
        latest_jam.start(timestamp)

        return bout, latest_jam
