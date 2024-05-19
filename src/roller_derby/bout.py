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


class SeriesManager(Encodable):
    def __init__(self):
        self.bouts: list[Bout] = [Bout()]
        self.currentBout: Bout = self.bouts[0]
        # self.teams: dict[str, Team] = dict()
        # self.timers: TimerManager = TimerManager()
        
class ClientException(Exception):
    pass