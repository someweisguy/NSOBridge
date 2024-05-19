from .jam import JamManager
from .team import TeamManager
from .timer import TimerManager
from .encodable import Encodable

class Bout(Encodable):
    def __init__(self) -> None:
        self._timers: TimerManager = TimerManager()
        self._jams: JamManager = JamManager()
        self._teams: TeamManager = TeamManager()

    @property
    def timers(self) -> TimerManager:
        return self._timers

    @property
    def jams(self) -> JamManager:
        return self._jams

    @property
    def teams(self) -> TeamManager:
        return self._teams


class BoutManager(Encodable):
    def __init__(self):
        self.bouts: list[Bout] = [Bout()]

class ClientException(Exception):
    pass