from __future__ import annotations
from abc import ABC
from .encodable import Encodable
from typing import Any, Literal, Self
import roller_derby.bout as bout


class AbstractAttribute(Encodable, ABC):
    def __init__(self, parent: TeamAttribute[Self]) -> None:
        self._parent: TeamAttribute[Self] = parent

    @property
    def parent(self) -> TeamAttribute[Self]:
        return self._parent

    @property
    def parentJam(self) -> bout.Jam:
        return self.parent.parentJam

    @property
    def parentPeriod(self) -> bout.Period:
        return self.parentJam.parentPeriod

    @property
    def parentBout(self) -> bout.Bout:
        return self.parentPeriod.parentBout

    def getOther(self) -> Self:
        assert self in (self.parent.home, self.parent.away)
        return self.parent.home if self is self.parent.away else self.parent.away

    def getTeam(self) -> Literal["home", "away"]:
        assert self in (self.parent.home, self.parent.away)
        return "home" if self is self.parent.home else "away"


class TeamAttribute[T: AbstractAttribute](Encodable):
    def __init__(self, parent: bout.Jam, cls: type[T]) -> None:
        if not isinstance(parent, bout.Jam):
            raise TypeError(f"Parent must be Jam type not {type(parent).__name__}")
        if not issubclass(cls, AbstractAttribute):
            raise TypeError("Attribute must be sub-class of AsbtractAttribute type")
        self._parent: bout.Jam = parent
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

    @property
    def parentJam(self) -> bout.Jam:
        return self._parent

    @property
    def parentPeriod(self) -> bout.Period:
        return self.parentJam.parentPeriod

    @property
    def parentBout(self) -> bout.Bout:
        return self.parentPeriod.parentBout

    def encode(self) -> dict[str, Any]:
        return self.home.encode() | self.away.encode()
