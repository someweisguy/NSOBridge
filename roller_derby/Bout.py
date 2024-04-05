from .Jam import JamManager
from .Team import TeamManager


class Bout:
    def __init__(self) -> None:
        self._teams: TeamManager = TeamManager()
        self._jams: JamManager = JamManager()

    def __len__(self) -> int:
        return len(self._jams[self._current_half])

    @property
    def teams(self) -> TeamManager:
        return self._teams

    @property
    def jams(self) -> JamManager:
        return self._jams
