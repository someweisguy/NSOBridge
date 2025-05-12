from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Final

from model.jam import Jam, StopReason
from model.protocols import TeamString
from model.timer import Timer

type JamId = tuple[int, int]


@dataclass(slots=True)
class Bout:
    ruleset_name: Final[str]
    timer: Final[Timer] = field(init=False, default_factory=Timer)
    jams: Final[tuple[list[Jam], list[Jam]]] = field(init=False, default=([Jam()], []))

    def __post_init__(self) -> None:
        self.timer.game_clock.reset(timedelta(minutes=30))
        self.timer.lineup_clock.reset(timedelta(seconds=30))
        self.timer.jam_clock.reset(timedelta(minutes=2))

    def get_jam(self, period_num: int, jam_num: int) -> Jam:
        try:
            return self.jams[period_num][jam_num]
        except KeyError:
            raise KeyError(f'Jam [{period_num}, {jam_num}] not found') from None

    def get_current_jam_id(self) -> JamId:
        period_num: int = 1 if len(self.jams[1]) > 0 else 0
        jam_num: int = len(self.jams[period_num]) - 1
        return (period_num, jam_num)

    def get_total_score(self, team: TeamString) -> int:
        all_jams: list[Jam] = [jam for period in self.jams for jam in period]
        return sum(jam.get_jam_score(team) for jam in all_jams)

    def start_jam(self, timestamp: datetime) -> None:
        jam_clock_alarm: timedelta = timedelta(minutes=2)

        # Update Timer state
        match self.timer.get_game_state():
            case 'intermission':
                if self.timer.intermission_clock.is_running():
                    self.timer.intermission_clock.stop(timestamp)
            case 'lineup':
                self.timer.lineup_clock.stop(timestamp)
            case 'jam' | 'timeout' | 'final':
                raise RuntimeError('A Jam cannot be started now') from None
        if not self.timer.game_clock.is_running():
            self.timer.game_clock.start(timestamp)
        self.timer.jam_clock.reset(jam_clock_alarm)
        self.timer.jam_clock.start(timestamp)

        # Update Jam state
        jam_id: JamId = self.get_current_jam_id()
        jam: Jam = self.get_jam(*jam_id)
        jam.start_timestamp = timestamp

    def stop_jam(self, timestamp: datetime) -> None:
        lineup_clock_alarm: timedelta = timedelta(seconds=30)

        # Guess the reason that the Jam is being stopped
        jam_id: JamId = self.get_current_jam_id()
        jam: Jam = self.get_jam(*jam_id)
        stop_reason: StopReason | None = None
        if jam.lead_is_declared():
            stop_reason = 'called'
        elif (
            self.timer.jam_clock.alarm is not None
            and self.timer.jam_clock.elapsed >= self.timer.jam_clock.alarm
        ):
            stop_reason = 'time'

        # Update Timer state
        if self.timer.get_game_state() != 'jam':
            raise RuntimeError('There is no active Jam to be stopped')
        self.timer.jam_clock.stop(timestamp)
        self.timer.lineup_clock.reset(lineup_clock_alarm)
        self.timer.lineup_clock.start(timestamp)

        # Update Jam state and add a new Jam
        jam.stop_timestamp = timestamp
        jam.stop_reason = stop_reason
        period_num, _ = jam_id
        self.jams[period_num].append(Jam())
