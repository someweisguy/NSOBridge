from server import Queryable


class TeamAttribute[T: Queryable]:
    __slots__ = '_home', '_away'

    def __init__(self, home: T, away: T) -> None:
        for team, name in zip((home, away), ('home', 'away')):
            if isinstance(team._id, tuple):
                team._id += (name, )
            else:
                team._id = (team._id, name)
        self._home: T = home
        self._away: T = away

    @property
    def home(self) -> T:
        return self._home

    @property
    def away(self) -> T:
        return self._away


class TeamOfficialAttribute[T: Queryable](TeamAttribute[T]):
    __slots__ = '_home', '_away', '_official'

    def __init__(self, home: T, away: T, official: T) -> None:
        super().__init__(home, away)
        name = 'official'
        if isinstance(official._id, tuple):
            official._id += (name, )
        else:
            official._id = (official._id, name)
        self._official: T = official

    @property
    def official(self) -> T:
        return self._official
