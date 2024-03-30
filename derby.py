from dataclasses import dataclass
from typing import Any, Iterable, SupportsIndex


@dataclass()
class Skater:
    """Represents a skater and their number. Skaters can be uniquely identified by their number."""

    number: str
    name: str

    def __init__(self, number: str, name: str) -> None:
        number = number.strip()
        if len(number) == 0:
            raise ValueError("Skater number must contain a value")
        self.number = number
        name = name.strip()
        if len(name) == 0:
            raise ValueError("Skater name must contain a value")
        self.name = name

    def __str__(self) -> str:
        return f"{self.number}: {self.name}"

    def __hash__(self) -> int:
        return hash(self.number)

    def __eq__(self, other) -> bool:
        if isinstance(other, Skater):
            return self.number == other.number
        elif isinstance(other, str):
            return self.number == other
        else:
            return False

    def is_sanctionable(self) -> bool:
        """Returns True if the skater number is valid for a sanctioned WFTDA game. Valid numbers contain at least one numeral but no more than four numerals."""
        return self.number.isnumeric() and len(self.number) <= 4


class Roster(list):
    def __init__(self, *, limit: None | int = None) -> None:
        if not isinstance(limit, int) and limit is not None:
            raise TypeError(
                f"limit must be None or int not type {type(limit).__name__}"
            )
        if isinstance(limit, int) and limit < 0:
            raise ValueError("limit must be greater than 0")
        self._limit: None | int = limit

    @property
    def limit(self) -> None | int:
        return self._limit

    def append(self, __object: Any) -> None:
        if __object in self:
            raise ValueError("Roster must not contain duplicates")
        if self._limit is not None and len(self) + 1 > self._limit:
            raise RuntimeError()  # TODO
        return super().append(__object)

    def extend(self, __iterable: Iterable) -> None:
        for item in __iterable:
            if item in self:
                raise ValueError("Roster must not contain duplicates")
        if self._limit is not None and len(self) + len(__iterable) > self._limit:
            raise RuntimeError()  # TODO
        return super().extend(__iterable)

    def insert(self, __index: SupportsIndex, __object: Any) -> None:
        if __object in self:
            raise ValueError("Roster must not contain duplicates")
        if self._limit is not None and len(self) + 1 > self._limit:
            raise RuntimeError()  # TODO
        return super().insert(__index, __object)


class Teams:
    class TeamData:
        def __init__(self) -> None:
            self._league: str = ""
            self._name: str = ""
            self._skaters: Roster[Skater] = Roster()

        @property
        def league(self) -> str:
            return self._league

        @league.setter
        def league(self, name: str) -> None:
            self._league = name

        @property
        def name(self) -> str:
            return self._name

        @name.setter
        def name(self, name: str) -> None:
            self._name = name

        @property
        def skaters(self) -> set[Skater]:
            return self._skaters

    def __init__(self) -> None:
        self._home = Teams.TeamData()
        self._away = Teams.TeamData()

    @property
    def home(self) -> TeamData:
        return self._home

    @property
    def away(self) -> TeamData:
        return self._away


""" TODO
- game.roster.home -- done
- game.jams.home
- game.lineups.home
- game.penalties.home
"""
