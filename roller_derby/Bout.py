from .Jam import JamManager
from .Team import Team


class Bout:
    def __init__(self) -> None:
        self._home: Team = Team()
        self._away: Team = Team()
        self._jams: JamManager = JamManager()

    def __len__(self) -> int:
        return len(self._jams[self._current_half])

    @property
    def home(self) -> Team:
        return self._home

    @property
    def away(self) -> Team:
        return self._away

    @property
    def jams(self) -> JamManager:
        return self._jams
