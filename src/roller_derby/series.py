from .encodable import Encodable
from .score import Bout


class Series(Encodable):
    def __init__(self):
        self._bouts: list[Bout] = [Bout()]
        self._currentBout: Bout = self._bouts[0]
        # self.teams: dict[str, Team] = dict()

    def __getitem__(self, boutIndex: int) -> Bout:
        return self._bouts[boutIndex]

    @property
    def bouts(self) -> list[Bout]:
        return self._bouts

    def addBout(self) -> None:
        self._bouts.append(Bout())

    def moveBout(self, fromIndex: int, toIndex: int) -> None:
        bout: Bout = self._bouts[fromIndex]
        self._bouts.insert(toIndex, bout)
        self._bouts.pop(fromIndex)

    def deleteBout(self, deleteIndex: int) -> None:
        self._bouts.pop(deleteIndex)

    @property
    def currentBout(self) -> Bout:
        return self._currentBout

    @currentBout.setter
    def currentBout(self, boutIndex: int) -> None:
        self._currentBout = self._bouts[boutIndex]

    def encode(self) -> dict:
        return {
            "currentBout": self._bouts.index(self._currentBout),
            "bouts": [bout.encode() for bout in self._bouts],
        }
