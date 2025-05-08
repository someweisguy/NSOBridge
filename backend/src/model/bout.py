from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Final

from .jam import Jam
from .protocols import TeamType
from .timer import Timer

type JamId = tuple[int, int]

@dataclass(slots=True)
class Bout:
    ruleset_name: Final[str]
    timer: Final[Timer] = field(init=False, default_factory=Timer)
    jams: Final[tuple[list[Jam], list[Jam]]] = field(init=False, default=([Jam()], []))

    def get_jam(self, period_num: int, jam_num: int) -> Jam:
        try:
            return self.jams[period_num][jam_num]
        except KeyError:
            raise KeyError(f'Jam [{period_num}, {jam_num}] not found') from None

    def get_current_jam_id(self) -> JamId:
        period_num: int = 1 if len(self.jams[1]) > 0 else 0
        jam_num: int = len(self.jams[period_num]) - 1
        return (period_num, jam_num)

    def get_total_score(self, team: TeamType) -> int:
        all_jams: list[Jam] = [j for period in self.jams for j in period]
        return sum(trip.points for jam in all_jams for trip in jam[team].score.trips)

    def start_jam(self, timestamp: datetime) -> None:
        game_clock_alarm: timedelta = timedelta(minutes=30)
        jam_clock_alarm: timedelta = timedelta(minutes=2)

        # Update game Timer state
        match self.timer.get_game_state():
            case 'intermission':
                self.timer.game_clock.reset(game_clock_alarm)
                self.timer.jam_clock.reset(jam_clock_alarm)
                self.timer.is_in_intermission = False
            case 'lineup':
                self.timer.jam_clock.reset(jam_clock_alarm)
            case 'jam' | 'timeout' | 'final':
                raise RuntimeError('The Jam cannot be started right now') from None
        self.timer.is_in_lineup = False
        self.timer.game_clock.start(timestamp)
        self.timer.jam_clock.start(timestamp)

        # Update Jam state
        jam_id: tuple[int, int] = self.get_current_jam_id()
        jam: Jam = self.get_jam(*jam_id)
        jam.start_timestamp = timestamp
