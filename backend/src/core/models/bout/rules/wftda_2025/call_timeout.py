from datetime import datetime

from core.models import Gettable, ProjectModel
from core.models.bout.bout import Bout, Timeout
from core.models.bout.jam import Jam


class CallTimeout(ProjectModel):
    def __call__(self, bout: Bout, timestamp: datetime) -> tuple[Gettable, ...]:
        if not bout.clocks.lineup.is_running():
            raise RuntimeError('A Timeout can only be called during Lineup')
        if bout.timeout_is_running():
            raise RuntimeError('Cannot call a Timeout when one is already running')

        # Stop the Lineup clock and the Period clock if it is running
        if bout.clocks.game.is_running():
            bout.clocks.game.stop(timestamp)
        bout.clocks.lineup.stop(timestamp)

        # Instantiate the Timeout
        current_jam: Jam = bout.get_active_jam() or bout.get_latest_jam()
        period_clock_elapsed = bout.clocks.game.get_elapsed_at_timestamp(timestamp)
        timeout: Timeout = Timeout(
            start_timestamp=timestamp,
            period_num=current_jam.id.period,
            jam_num=current_jam.id.jam,
            period_clock_elapsed=period_clock_elapsed,
        )
        bout.timeouts.append(timeout)

        return (bout,)
