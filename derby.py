from dataclasses import dataclass
from typing import Any, Iterable, SupportsIndex, Iterator
from datetime import datetime, timedelta


@dataclass()
class Skater:
    """Represents a skater and their number. Skaters can be uniquely identified by their number."""

    number: str
    name: str
    pronouns: str

    def __init__(self, number: str, name: str, pronouns: str = "") -> None:
        number = number.strip()
        if len(number) == 0:
            raise ValueError("Skater number must contain a value")
        self.number = number
        name = name.strip()
        if len(name) == 0:
            raise ValueError("Skater name must contain a value")
        self.name = name
        self.pronouns = pronouns

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


class Team:
    class Data:
        def __init__(self) -> None:
            self._league: str = ""
            self._name: str = ""
            self._skaters: list[Skater] = []

        def __iter__(self) -> Iterator[Skater]:
            return self._skaters.__iter__()

        def __next__(self) -> Skater:
            return self._skaters.__next__()

        def __getitem__(self, key: str | int) -> Skater:
            if not isinstance(key, str) and not isinstance(key, int):
                raise TypeError(f"key must be str or int, not f{type(key).__name__}")
            if isinstance(key, str):
                key = self._skaters.index(key)
            return self._skaters[key]

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
        def skaters(self) -> list[Skater]:
            return self._skaters.copy()

        def add_skater(self, skater: Skater) -> None:
            if not isinstance(skater, Skater):
                raise TypeError(f"skater must be a Skater, not {type(skater).__name__}")
            if skater in self._skaters:
                raise ValueError("skater is already in roster")
            self._skaters.append(skater)

        def remove_skater(self, key: Skater | str) -> None:
            if key not in self._skaters:
                raise ValueError("skater is not in roster")
            if isinstance(key, str):
                key = self._skaters.index(key)
            del self._skaters[key]

    def __init__(self) -> None:
        self._home: Team.Data = Team.Data()
        self._away: Team.Data = Team.Data()

    @property
    def home(self) -> Data:
        return self._home

    @property
    def away(self) -> Data:
        return self._away


class Jam:
    CALL_REASONS: frozenset[str] = frozenset({"Called", "Injury"})

    class Data:
        """A class for representing Jam data for each Team."""

        def __init__(self) -> None:
            self._lead: bool = False
            self._lost: bool = False
            self._star_pass: None | int = None
            self._trips: list[int] = []
            self._timestamps: list[datetime] = []

        @property
        def lead(self) -> bool:
            """Set to True if the Jammer Referee signals that the Jammer is Lead. During an Overtime Jam: There will be no Lead Jammer, leave False. The default is False."""
            return self._lead

        @lead.setter
        def lead(self, new_value: bool) -> None:
            if not isinstance(new_value, bool):
                raise TypeError(f"lead must be bool, not {type(new_value).__name__}")
            self._lead = new_value

        @property
        def lost(self) -> bool:
            """Set to True when a Jammer loses the ability to become Lead Jammer or loses Lead Jammer status itself. Do not set to True if the Jammer is eligible but the opposing Jammer is declared Lead Jammer status first. The default is False."""
            return self._lost

        @lost.setter
        def lost(self, new_value: bool) -> None:
            if not isinstance(new_value, bool):
                raise TypeError(f"lost must be bool, not {type(new_value).__name__}")
            self._lost = new_value

        @property
        def star_pass(self) -> None | int:
            """Set to the trip number in which a star pass was successfully completed or None if a star pass did not occur. The default is None."""
            return self._star_pass

        @star_pass.setter
        def star_pass(self, new_value: None | int) -> None:
            if new_value is not None and not isinstance(new_value, int):
                raise TypeError(
                    f"star_pass must be None or int, not {type(new_value).__name__}"
                )
            if new_value is not None and new_value > len(self._trips):
                raise ValueError(
                    "star_pass trip must be less than the total number of trips"
                )
            self._star_pass = new_value

        @property
        def trips(self) -> tuple[int]:
            """A tuple of the points earned in each trip. The initial trip is index 0 and is always equal to 0. If the len() of this property is 0, no initial pass has occurred."""
            assert len(self._trips) == len(self._timestamps)
            return tuple(self._trips)

        @property
        def timestamps(self) -> tuple[datetime]:
            """A tuple of the timestamps at which each trip was completed."""
            assert len(self._timestamps) == len(self._trips)
            return tuple(self._timestamps)

        def add_trip(self, timestamp: datetime, points: int) -> None:
            """Add a trip to the jam. The initial trip should always be equal to 0."""
            if not isinstance(timestamp, datetime):
                raise TypeError(
                    f"timestamp must be datetime, not {type(points).__name__}"
                )
            if not isinstance(points, int):
                raise TypeError(f"points must be int, not {type(points).__name__}")
            if 0 > points > 4:
                raise ValueError(f"points must be between 0 and 4, not {points}")
            if len(self._trips) == 0 and points != 0:
                raise RuntimeError("initial pass must be 0 points")
            self._trips.append(points)
            self._timestamps.append(timestamp)

        def update_trip(self, index: int, points: int) -> None:
            """Update the amount of points earned in a trip."""
            if not isinstance(points, int):
                raise TypeError(f"points must be int, not {type(points).__name__}")
            if 0 > points > 4:
                raise ValueError(f"points must be between 0 and 4, not {points}")
            if index == 0 and points != 0:
                raise RuntimeError("initial pass must be 0 points")
            self._trips[index] = points

        def remove_trip(self) -> None:
            """Remove the most recent trip in the jam. If the trip in which a star pass occurred is removed, the star_pass property will be set to None."""
            del self._trips[-1]
            del self._timestamps[-1]
            if self._star_pass is not None and self._star_pass > len(self._trips):
                self._star_pass = None

    def __init__(self) -> None:
        self._start: None | datetime = None
        self._stop: None | datetime = None
        self._call_reason: str = None
        self._home: Jam.Data = Jam.Data()
        self._away: Jam.Data = Jam.Data()

    @property
    def start(self) -> None | datetime:
        return self._start

    @start.setter
    def start(self, new_value: None | datetime) -> None:
        if new_value is not None and not isinstance(new_value, datetime):
            raise TypeError(
                f"start must be None or datetime not {type(new_value).__name__}"
            )
        self._start = new_value

    @property
    def stop(self) -> None | datetime:
        return self._stop

    @stop.setter
    def stop(self, new_value: None | datetime) -> None:
        if new_value is not None and not isinstance(new_value, datetime):
            raise TypeError(
                f"stop must be None or datetime not {type(new_value).__name__}"
            )
        self._stop = new_value

    @property
    def call_reason(self) -> None | str:
        return self._call_reason

    @call_reason.setter
    def call_reason(self, new_value: None | str) -> None:
        if new_value is not None and not isinstance(new_value, str):
            raise TypeError(
                f"call_reason must be None or str not {type(new_value).__name__}"
            )
        if new_value not in Jam.CALL_REASONS:
            raise ValueError(f"call_reason must be one of {list(Jam.CALL_REASONS)}")
        self._call_reason = new_value

    @property
    def duration(self) -> None | timedelta:
        if self._start is None or self._stop is None:
            return None
        return self._stop - self._start

    @property
    def home(self) -> Data:
        return self._home

    @property
    def away(self) -> Data:
        return self._away

    def has_started(self) -> bool:
        """Returns True if the jam has started."""
        return self._start is not None

    def has_ended(self) -> bool:
        """Returns True if the jam has ended."""
        return self._stop is not None


""" TODO
- game.teams.home
- game.roster.home/away    -- done
- game.jam.home/away       -- done
- game.timers
- game.lineups.home/away   
- game.penalties.home/away
"""
