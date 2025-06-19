from __future__ import annotations

from typing import Callable, Final

from core.models.bout.bout import Referee
from core.models.bout.rules.wftda_2025 import referee_factory as wftda_2025


def get_ruleset(ruleset: str) -> Referee:
    return _REFEREE_FACTORIES[ruleset]()


_REFEREE_FACTORIES: Final[dict[str, Callable[[], Referee]]] = {'WFTDA 2025': wftda_2025}
