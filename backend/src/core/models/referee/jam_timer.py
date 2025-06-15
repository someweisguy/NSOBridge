from dataclasses import dataclass
import datetime
from typing import Callable, Protocol

from core.models.bout import Jam, JamId
from model.referee.referee import RefereeProtocol
from model.timer import Timeout
from core import updater
from core.responses import JSONable



class JamTimer(RefereeProtocol):
    @property
    def update_keys(self) -> list[JSONable]:
        return [
            updater.kf.bout(self.bout_id),
            updater.kf.jam(
                self.bout_id,
            ),
        ]

    def start_jam(self, timestamp: datetime) -> None:
        if self.bout.clocks.jam.is_running():
            raise RuntimeError('A Jam cannot be started when one is already running')
        if self.bout.timeout_is_running():
            raise RuntimeError('Cannot start a Jam when a Timeout is running')

        # Update clocks
        for clock in [self.bout.clocks.intermission, self.bout.clocks.lineup]:
            if clock.is_running():
                clock.stop(timestamp)
        if not self.bout.clocks.game.is_running():
            self.bout.clocks.game.start(timestamp)
        self.bout.clocks.jam.reset()
        self.bout.clocks.jam.start(timestamp)

        # Set Jam data
        latest_jam_id: JamId = self.bout.get_latest_jam_id()
        jam: Jam = self.bout.get_jam(*latest_jam_id)
        jam.start_timestamp = timestamp
        
        updater.kf.bout(self.bout_id)

    def stop_jam(self, timestamp: datetime) -> None:
        if not self.bout.clocks.jam.is_running():
            raise RuntimeError('Cannot stop a Jam when there is none running')
        active_jam_id: JamId = self.bout.get_active_jam_id()
        if (
            active_jam_id is None
            or not self.bout.get_jam(*active_jam_id).start_timestamp
        ):
            raise RuntimeError('There is no running Jam to stop')

        # Update clocks
        self.bout.clocks.jam.stop(timestamp)
        self.bout.clocks.lineup.reset()
        self.bout.clocks.lineup.start(timestamp)

        # Set Jam data
        jam: Jam = self.bout.get_jam(*active_jam_id)
        jam.elapsed = timestamp - jam.start_timestamp

        # Guess the reason that the Jam is being stopped
        if jam.lead_is_declared():
            jam.stop_reason = 'called'
        elif jam.elapsed >= self.bout.JAM_DURATION:
            jam.stop_reason = 'time'
        else:
            jam.stop_reason = None

        # Add a new Jam
        period_num, _ = active_jam_id
        self.bout.jams[period_num].append(Jam())

    def call_timeout(self, timestamp: datetime) -> None:
        if not self.bout.clocks.lineup.is_running():
            raise RuntimeError('A Timeout can only be called during Lineup')
        if self.bout.timeout_is_running():
            raise RuntimeError('Cannot call a Timeout when one is already running')

        # Stop the Lineup clock and the Period clock if it is running
        if self.bout.clocks.game.is_running():
            self.bout.clocks.game.stop(timestamp)
        self.bout.clocks.lineup.stop(timestamp)

        # Instantiate the Timeout
        period_num, jam_num = (
            self.bout.get_active_jam_id() or self.bout.get_latest_jam_id()
        )
        period_clock_elapsed = self.bout.clocks.game.get_elapsed_at_timestamp(timestamp)
        timeout: Timeout = Timeout(
            start_timestamp=timestamp,
            period_num=period_num,
            jam_num=jam_num,
            period_clock_elapsed=period_clock_elapsed,
        )
        self.bout.timeouts.append(timeout)

    def end_timeout(self, timestamp: datetime) -> None:
        if not self.bout.timeout_is_running():
            raise RuntimeError('Cannot end a Timeout when one is not running')

        timeout: Timeout = self.bout.timeouts[-1]
        timeout.stop(timestamp)

        # Add the Timeout duration to the Lineup clock and start the Lineup clock
        # This is done because it can help prevent some logic errors in the frontend
        # code. The game-state will be 'lineup' only when the Lineup clock is running.
        self.bout.clocks.lineup.elapsed += timeout.get_elapsed_at_timestamp(timestamp)
        self.bout.clocks.lineup.start(timestamp)

        # Subtract the timeout or official review, if not retained
        if timeout.team is None or timeout.team == 'official':
            return
        if not timeout.is_review or not timeout.retained:
            timeout_type = 'review' if timeout.is_review else 'timeout'
            self.bout[timeout.team].clock_stops[timeout_type] -= 1

    def end_period(self, timestamp: datetime) -> None:
        pass
