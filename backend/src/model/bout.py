from dataclasses import dataclass, field
from typing import Final

from .jam import Jam, JamId
from .protocols import TeamType
from .timer import Timer


@dataclass(slots=True)
class Bout:
    ruleset_name: Final[str]
    timer: Final[Timer] = field(init=False, default_factory=Timer)
    jams: Final[tuple[list[Jam], list[Jam]]] = field(init=False, default=([Jam()], []))

    def get_jam(self, jam_id: JamId) -> Jam:
        period, jam = jam_id
        try:
            return self.jams[period][jam]
        except KeyError:
            raise KeyError(f'Jam {jam_id} not found') from None

    def get_score(self, team: TeamType) -> int:
        all_jams: list[Jam] = [jam for period in self.jams for jam in period]
        return sum(trip.points for jam in all_jams for trip in jam[team].score.trips)