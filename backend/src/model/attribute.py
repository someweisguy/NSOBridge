from __future__ import annotations
from copy import deepcopy
from typing import Any, Literal


class TeamAttribute[T: Any]:
    __slots__ = '_home', '_away'

    def __init__(self, home: T, away: T) -> None:
        self._home: T = home
        self._away: T = away
        
    def __deepcopy__(self, memo) -> TeamAttribute[T]:
        return TeamAttribute(deepcopy(self.home, memo), 
                             deepcopy(self.away, memo))

    @property
    def home(self) -> T:
        return self._home

    @property
    def away(self) -> T:
        return self._away

    def __getitem__(self, item: Literal['home', 'away']) -> T:
        return getattr(self, item)


class TeamOfficialAttribute[T: Any](TeamAttribute[T]):
    __slots__ = '_official'

    def __init__(self, home: T, away: T, official: T) -> None:
        super().__init__(home, away)
        self._official: T = official
        
    def __deepcopy__(self, memo) -> TeamOfficialAttribute[T]:
        return TeamOfficialAttribute(deepcopy(self.home, memo), 
                                     deepcopy(self.away, memo),
                                     deepcopy(self.official, memo))

    @property
    def official(self) -> T:
        return self._official

    def __getitem__(self, item: Literal['home', 'away', 'official']) -> T:
        return getattr(self, item)
