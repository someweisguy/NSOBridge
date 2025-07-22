from dataclasses import dataclass

from core.models.rules.wftda_2025.start_jam import StartJam
from core.models.rules.wftda_2025.stop_jam import StopJam


@dataclass
class Referee:
    start_jam: type[StartJam] = StartJam
    stop_jam: type[StopJam] = StopJam
