from dataclasses import dataclass, field
from typing import Final

from .jam import Jam
from .protocols import TeamType
from .timer import Timer


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

    def get_total_score(self, team: TeamType) -> int:
        all_jams: list[Jam] = [j for period in self.jams for j in period]
        return sum(trip.points for jam in all_jams for trip in jam[team].score.trips)
