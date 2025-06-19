from dataclasses import dataclass
from datetime import datetime
from typing import Iterable

from core import updater
from core.models import ModelKey
from core.models.bout.bout import Bout, Timeout


@dataclass(slots=True)
class EndTimeout:
    def __call__(self, bout: Bout, timestamp: datetime) -> Iterable[ModelKey]:
        if not bout.timeout_is_running():
            raise RuntimeError('Cannot end a Timeout when one is not running')

        timeout: Timeout = bout.timeouts[-1]
        timeout.stop(timestamp)

        # Add the Timeout duration to the Lineup clock and start the Lineup clock
        # This is done because it can help prevent some logic errors in the frontend
        # code. The game-state will be 'lineup' only when the Lineup clock is running.
        bout.clocks.lineup.elapsed += timeout.get_elapsed_at_timestamp(timestamp)
        bout.clocks.lineup.start(timestamp)

        # Subtract the timeout or official review, if not retained
        if timeout.team is None or timeout.team == 'official':
            return
        if not timeout.is_review or not timeout.retained:
            pass  # FIXME: decrement the timeout/review count

        return updater.kf.bout(bout.id)
