from datetime import datetime

from core.models import Gettable, ProjectModel
from core.models.bout.bout import Bout, Timeout


class EndTimeout(ProjectModel):
    def __call__(self, bout: Bout, timestamp: datetime) -> tuple[Gettable, ...]:
        if not bout.timeout_is_running():
            raise RuntimeError('Cannot end a Timeout when one is not running')

        timeout: Timeout = bout.timeouts[-1]
        timeout.stop(timestamp)

        # Add the Timeout duration to the Lineup clock and start the Lineup clock
        # This is done because it can help prevent some logic errors in the frontend
        # code. The game-state will be 'lineup' only when the Lineup clock is running.
        bout.clocks.lineup.start(timestamp - timeout.elapsed)

        # Subtract the timeout or official review, if not retained
        if not timeout.is_review or not timeout.retained:
            pass  # FIXME: decrement the timeout/review count

        return (bout,)
