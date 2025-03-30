from dataclasses import dataclass, field
from typing import Final

from attribute import TeamType
from clock import BoutTime
from jam import Jam, JamId, Score


@dataclass(slots=True)
class Bout:
    ruleset_name: Final[str]
    clock: Final[BoutTime] = field(init=False, default_factory=BoutTime)
    jams: Final[tuple[list[Jam], list[Jam]]] = field(init=False,
                                                     default=([Jam()], []))

    def get_jam(self, jam_id: JamId) -> Jam:
        period, jam = jam_id
        return self.jams[period][jam]
