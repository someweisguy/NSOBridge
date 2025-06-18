from dataclasses import dataclass
from datetime import datetime
from typing import Iterable

from core import updater
from core.models.bout.bout import Bout, Timeout
from core.models.bout.jam import Jam


@dataclass(slots=True)
class CallTimeout:
    bout: Bout
    timestamp: datetime

    def execute(self) -> None:
        if not self.bout.clocks.lineup.is_running():
            raise RuntimeError('A Timeout can only be called during Lineup')
        if self.bout.timeout_is_running():
            raise RuntimeError('Cannot call a Timeout when one is already running')

        # Stop the Lineup clock and the Period clock if it is running
        if self.bout.clocks.game.is_running():
            self.bout.clocks.game.stop(self.timestamp)
        self.bout.clocks.lineup.stop(self.timestamp)

        # Instantiate the Timeout       
        current_jam: Jam = self.bout.get_active_jam() or self.bout.get_latest_jam()
        period_clock_elapsed = self.bout.clocks.game.get_elapsed_at_timestamp(
            self.timestamp
        )
        timeout: Timeout = Timeout(
            start_timestamp=self.timestamp,
            period_num=current_jam.id.period,
            jam_num=current_jam.id.jam,
            period_clock_elapsed=period_clock_elapsed,
        )
        self.bout.timeouts.append(timeout)

    def get_update_keys(self) -> Iterable:
        return updater.kf.bout(self.bout.id)
