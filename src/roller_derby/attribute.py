from __future__ import annotations
from abc import ABC
from typing import Any, Self, TYPE_CHECKING
from server import Encodable

if TYPE_CHECKING:
    from roller_derby.bout import Bout, Jam, Period, TEAMS


class AbstractAttribute[P: _AbstractTeamAttribute](Encodable, ABC):
    def __init__(self, parent: P) -> None:
        super().__init__()
        self._parent: P = parent

    @property
    def parent(self) -> P:
        return self._parent

    def getOther(self) -> Self:
        return self.parent.home if self is self.parent.away else self.parent.away

    def getTeam(self) -> TEAMS:
        return "home" if self is self.parent.home else "away"


class _AbstractTeamAttribute[T: AbstractAttribute](Encodable, ABC):
    def __init__(self, parent: Any, cls: type[T]) -> None:
        super().__init__()
        self._parent: Any = parent
        self._home: T = cls(self)
        self._away: T = cls(self)

    def __getitem__(self, item: TEAMS) -> T:
        match item:
            case "home":
                return self._home
            case "away":
                return self._away
            case _:
                raise KeyError(f"unknown team {item}")

    @property
    def home(self) -> T:
        return self._home

    @property
    def away(self) -> T:
        return self._away

    def encode(self) -> dict[str, Encodable.PRIMITIVE]:
        return {"home": self.home.encode(), "away": self.away.encode()}


class JamTeamAttribute[T: AbstractAttribute](_AbstractTeamAttribute[T]):
    def __init__(self, parent: Jam, cls: type[T]) -> None:
        super().__init__(parent, cls)

    @property
    def parentJam(self) -> Jam:
        return self._parent


class PeriodTeamAttribute[T: AbstractAttribute](_AbstractTeamAttribute[T]):
    def __init__(self, parent: Period, cls: type[T]) -> None:
        super().__init__(parent, cls)

    @property
    def parentPeriod(self) -> Period:
        return self._parent


class BoutTeamAttribute[T: AbstractAttribute](_AbstractTeamAttribute[T]):
    def __init__(self, parent: Bout, cls: type[T]) -> None:
        super().__init__(parent, cls)

    @property
    def parentBout(self) -> Bout:
        return self._parent
