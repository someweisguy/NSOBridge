from dataclasses import dataclass
from datetime import datetime
from typing import Iterable

from core import updater
from core.models.bout.bout import Bout, Timeout


@dataclass(slots=True)
class EndTimeout:
    bout: Bout
    timestamp: datetime

    def execute(self) -> None:
        if not self.bout.timeout_is_running():
            raise RuntimeError('Cannot end a Timeout when one is not running')

        timeout: Timeout = self.bout.timeouts[-1]
        timeout.stop(self.timestamp)

        # Add the Timeout duration to the Lineup clock and start the Lineup clock
        # This is done because it can help prevent some logic errors in the frontend
        # code. The game-state will be 'lineup' only when the Lineup clock is running.
        self.bout.clocks.lineup.elapsed += timeout.get_elapsed_at_timestamp(
            self.timestamp
        )
        self.bout.clocks.lineup.start(self.timestamp)

        # Subtract the timeout or official review, if not retained
        if timeout.team is None or timeout.team == 'official':
            return
        if not timeout.is_review or not timeout.retained:
            pass  # FIXME: decrement the timeout/review count

    def get_update_keys(self) -> Iterable:
        return updater.kf.bout(self.bout.id)
