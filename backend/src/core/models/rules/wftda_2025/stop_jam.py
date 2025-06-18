from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import ClassVar, Iterable

from core import updater
from core.models.bout.bout import Bout
from core.models.bout.jam import Jam


@dataclass(slots=True)
class StopJam:
    JAM_DURATION: ClassVar[timedelta] = timedelta(minutes=2)

    bout: Bout
    timestamp: datetime

    def execute(self) -> None:
        if not self.bout.clocks.jam.is_running():
            raise RuntimeError('Cannot stop a Jam when there is none running')
        jam: Jam | None = self.bout.get_active_jam()
        if jam is None or not jam.is_running():
            raise RuntimeError('There is no running Jam to stop')

        # Update clocks
        self.bout.clocks.jam.stop(self.timestamp)
        self.bout.clocks.lineup.reset()
        self.bout.clocks.lineup.start(self.timestamp)

        # Stop the current Jam
        jam.stop(self.timestamp)

        # Guess the reason that the Jam is being stopped
        if jam.lead_is_declared():
            jam.stop_reason = 'called'
        elif jam.elapsed >= self.JAM_DURATION:
            jam.stop_reason = 'time'
        else:
            jam.stop_reason = None

        # Add a new Jam
        new_jam: Jam = self.bout.push_jam()
        new_jam.team_jams = self.bout.teams

    def get_update_keys(self) -> Iterable:
        return [
            updater.kf.bout(self.bout.id),
            updater.kf.jam(self.bout.get_jam(-1, -2)),
            updater.kf.jam(self.bout.get_jam(-1, -1)),
        ]
