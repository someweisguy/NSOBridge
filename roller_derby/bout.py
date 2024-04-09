from .jam import JamManager
from .team import TeamManager


class Bout:
    def __init__(self) -> None:
        self._teams: TeamManager = TeamManager()
        self._jams: JamManager = JamManager()

    def __len__(self) -> int:
        return 0  # TODO

    @property
    def teams(self) -> TeamManager:
        return self._teams

    @property
    def jams(self) -> JamManager:
        return self._jams
