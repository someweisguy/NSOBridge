from __future__ import annotations
from abc import ABC
from typing import Self, TYPE_CHECKING
from backend.src.roller_derby.timeout import OFFICIAL
from server import Encodable

if TYPE_CHECKING:
    from roller_derby.bout import Bout, Jam, TEAMS


class AbstractAttribute[T: (Bout, Jam)](Encodable, ABC):
    def __init__(self, parent: T) -> None:
        super().__init__()
        self._teamParent: None | TeamAttribute[Self] = None
        self._parent: T = parent

    @property
    def parent(self) -> T:
        return self._parent

    def getOther(self) -> Self:
        if self._teamParent is None:
            raise RuntimeError('this attribute is not associated with a team')
        return (self._teamParent._home if self is self._teamParent._away
                else self._teamParent._away)

    def getTeam(self) -> TEAMS:
        if self._teamParent is None:
            raise RuntimeError('this attribute is not associated with a team')
        return 'home' if self is self._teamParent._home else 'away'


class TeamAttribute[U: AbstractAttribute](Encodable):
    def __init__(self, home: U, away: U) -> None:
        # Don't call super().__init__() to avoid creating a UUID
        home._teamParent = self
        away._teamParent = self
        self._home: U = home
        self._away: U = away

    def __getitem__(self, team: TEAMS) -> U:
        if team == 'home':
            return self._home
        elif team == 'away':
            return self._away
        else:
            raise KeyError(f'unknown team \'{team}\'')

    @property
    def home(self) -> U:
        return self._home

    @property
    def away(self) -> U:
        return self._away

    def encode(self) -> dict[str, Encodable.PRIMITIVE]:
        return {
            'home': self._home.encode(),
            'away': self._away.encode()
        }


class TeamOfficialAttribute[U: AbstractAttribute](TeamAttribute[U]):
    def __init__(self, home: U, away: U, official: U) -> None:
        super().__init__(home, away)
        official._teamParent = self
        self._official: U = official

    def __getitem__(self, team: TEAMS | OFFICIAL) -> U:
        if team == 'official':
            return self._official
        else:
            return super().__getitem__(team)

    @property
    def official(self) -> U:
        return self._official

    def encode(self) -> dict[str, Encodable.PRIMITIVE]:
        return {
            **super().encode(),
            'official': self._official.encode()
        }
