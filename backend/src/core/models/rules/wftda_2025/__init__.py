from typing import Final

from core.models.rules import BoutTimer
from core.models.rules.wftda_2025.start_jam import StartJam

BOUT_TIMER: Final[BoutTimer] = BoutTimer(start_jam=StartJam)
