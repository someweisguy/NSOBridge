from dataclasses import dataclass
from datetime import datetime
from typing import Iterable

from core import updater
from core.models.bout.bout import Bout
from core.models.bout.jam import Jam


@dataclass(slots=True)
class StartJam:
    bout: Bout
    timestamp: datetime

    def execute(self) -> None:
        if self.bout.clocks.jam.is_running():
            raise RuntimeError('A Jam cannot be started when one is already running')
        if self.bout.timeout_is_running():
            raise RuntimeError('Cannot start a Jam when a Timeout is running')

        # Update clocks
        for clock in [self.bout.clocks.intermission, self.bout.clocks.lineup]:
            if clock.is_running():
                clock.stop(self.timestamp)
        if not self.bout.clocks.game.is_running():
            self.bout.clocks.game.start(self.timestamp)
        self.bout.clocks.jam.reset()
        self.bout.clocks.jam.start(self.timestamp)

        # Set Jam data
        latest_jam: Jam = self.bout.get_latest_jam()
        latest_jam.start(self.timestamp)

    def get_update_keys(self) -> Iterable:
        return updater.kf.bout(self.bout.id)
