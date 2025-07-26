from typing import Final

from rules.rules import AbstractReferee
from rules.wftda_2025 import WFTDA2025Referee

REFEREES: Final[dict[str, type[AbstractReferee]]] = {
    'WFTDA 2025': WFTDA2025Referee,
}

assert len(REFEREES.items()) > 0, 'There must be at least 1 Referee defined'


__all__ = ('REFEREES',)
