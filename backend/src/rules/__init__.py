from typing import Final

from rules.referees import Referee

from .wftda_2025 import WFTDA_2025_Referee

REFEREES: Final[dict[str, type[Referee]]] = {
    'WFTDA 2025': WFTDA_2025_Referee,
}

assert len(REFEREES.items()) > 0, 'There must be at least 1 Referee defined'


__all__ = ('REFEREES',)
