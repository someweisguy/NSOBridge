from dataclasses import dataclass

from core.models.rules.wftda_2025.start_jam import StartJam


@dataclass
class Referee:
    start_jam: type[StartJam] = StartJam
