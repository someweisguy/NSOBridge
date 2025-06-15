from __future__ import annotations

from dataclasses import dataclass
from typing import Final

from core.models.referee.jam_timer import JamTimer


@dataclass(slots=True)
class Ruleset:
    jam_timer: type[JamTimer]


RULESETS: Final[dict[str, Ruleset]] = {'WFTDA 2025': Ruleset(JamTimer)}
