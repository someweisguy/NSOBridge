from __future__ import annotations
from dataclasses import dataclass
from .encodable import Encodable
import roller_derby.bout as bout


@dataclass
class JamIndex(Encodable):
    period: int
    jam: int

    @staticmethod
    def decode(index: dict[str, int]) -> JamIndex:
        return JamIndex(**index)

    def encode(self) -> dict:
        return {"period": self.period, "jam": self.jam}


class Series(Encodable):
    def __init__(self):
        self._bouts: list[bout.Bout] = [bout.Bout()]
        self._currentBout: bout.Bout = self._bouts[0]
        # self.teams: dict[str, Team] = dict()

    def __getitem__(self, boutIndex: int) -> bout.Bout:
        return self._bouts[boutIndex]

    @property
    def bouts(self) -> list[bout.Bout]:
        return self._bouts

    def addBout(self) -> None:
        self._bouts.append(bout.Bout())

    def moveBout(self, fromIndex: int, toIndex: int) -> None:
        bout: bout.Bout = self._bouts[fromIndex]
        self._bouts.insert(toIndex, bout)
        self._bouts.pop(fromIndex)

    def deleteBout(self, deleteIndex: int) -> None:
        self._bouts.pop(deleteIndex)

    @property
    def currentBout(self) -> bout.Bout:
        return self._currentBout

    @currentBout.setter
    def currentBout(self, boutIndex: int) -> None:
        self._currentBout = self._bouts[boutIndex]

    def encode(self) -> dict:
        return {
            "currentBout": self._bouts.index(self._currentBout),
            "bouts": [bout.encode() for bout in self._bouts],
        }
