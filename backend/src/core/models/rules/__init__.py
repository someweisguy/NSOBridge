from typing import Final

from core.models.rules.referees import Referee

from .wftda_2025 import Referee as WFTDA_2025_REFEREE

REFEREES: Final[dict[str, type[Referee]]] = {
    'WFTDA 2025': WFTDA_2025_REFEREE,
}

assert len(REFEREES.items()) > 0, 'There must be at least 1 Referee defined'


__all__ = ('REFEREES',)
