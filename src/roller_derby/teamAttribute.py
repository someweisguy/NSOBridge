from __future__ import annotations
from abc import ABC
from typing import Literal, Self
import roller_derby.bout as bout
import server


class AbstractAttribute(server.Encodable, ABC):
    def __init__(self, parent: TeamAttribute[Self]) -> None:
        super().__init__()
        self._parent: TeamAttribute[Self] = parent

    @property
    def parent(self) -> TeamAttribute[Self]:
        return self._parent

    def getOther(self) -> Self:
        assert self in (self.parent.home, self.parent.away), "misconfigured Attribute"
        return self.parent.home if self is self.parent.away else self.parent.away

    def getTeam(self) -> Literal["home", "away"]:
        assert self in (self.parent.home, self.parent.away), "misconfigured Attribute"
        return "home" if self is self.parent.home else "away"


class TeamAttribute[T: AbstractAttribute](server.Encodable):
    def __init__(self, cls: type[T]) -> None:
        if not issubclass(cls, AbstractAttribute):
            raise TypeError("Attribute must be sub-class of AsbtractAttribute type")
        super().__init__()
        self._home: T = cls(self)
        self._away: T = cls(self)

    def __getitem__(self, team: bout.Jam.TEAMS) -> T:
        match team:
            case "home":
                return self.home
            case "away":
                return self.away
            case _:
                raise KeyError(f"unknown team '{team}'")

    @property
    def home(self) -> T:
        return self._home

    @property
    def away(self) -> T:
        return self._away

    def encode(self) -> dict[str, server.Encodable.PRIMITIVE]:
        return self.home.encode() | self.away.encode()
