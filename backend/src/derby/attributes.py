from server import Queryable


class TeamAttribute[T]:
    __slots__ = '_home', '_away'

    def __init__(self, home: T, away: T) -> None:
        self._home: T = home
        self._away: T = away

    @property
    def home(self) -> T:
        return self._home

    @property
    def away(self) -> T:
        return self._away
    
    def __getitem__(self, item: str) -> T:
        return getattr(self, item)


class TeamOfficialAttribute[T: Queryable](TeamAttribute[T]):
    __slots__ = '_official'

    def __init__(self, home: T, away: T, official: T) -> None:
        super().__init__(home, away)
        self._official: T = official

    @property
    def official(self) -> T:
        return self._official
