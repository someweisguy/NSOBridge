from datetime import datetime
from dataclasses import dataclass


@dataclass
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
        """Returns True if the skater number is valid for a sanctioned WFTDA
        game. Valid numbers contain at least one numeral but no more than four
        numerals."""
        return self.number.isnumeric() and len(self.number) <= 4


class Bout:
    pass


class Team:
    def __init__(self, parent_bout: Bout) -> None:
        if not isinstance(parent_bout, Bout):
            raise TypeError(
                f"parent_bout must be Bout, not {type(parent_bout).__name__}"
            )
        self._parent_bout: Bout = parent_bout
        self._league_name = ""
        self._name = ""

    @property
    def league(self) -> str:
        return self._league_name

    @league.setter
    def league(self, value: str) -> None:
        if not isinstance(value, str):
            raise TypeError(f"league must be str, not {type(value).__name__}")
        self._league_name = value

    @property
    def name(self) -> str:
        return self._name

    @name.setter
    def league(self, value: str) -> None:
        if not isinstance(value, str):
            raise TypeError(f"name must be str, not {type(value).__name__}")
        self._name = value


class Jam:
    class Data:
        """A class for representing Jam data for each Team."""

        def __init__(self) -> None:
            self._lead: bool = False
            self._lost: bool = False
            self._no_pivot: bool = False
            self._star_pass: None | int = None
            self._trips: list[int] = []
            self._timestamps: list[datetime] = []

        @property
        def lead(self) -> bool:
            return self._lead

        @property
        def lost(self) -> bool:
            return self._lost

        @property
        def no_pivot(self) -> bool:
            return self._no_pivot

        @no_pivot.setter
        def no_pivot(self, value: bool) -> None:
            if not isinstance(value, bool):
                raise TypeError(f"no_pivot must be bool, not {type(value).__name__}")
            if self._star_pass is not None:
                raise RuntimeError(
                    "cannot set no_pivot, a star pass has already occurred"
                )
            self._no_pivot = value

        @property
        def star_pass(self) -> None | int:
            return self._star_pass

        @star_pass.setter
        def star_pass(self, value: None | int) -> None:
            if value is not None and not isinstance(value, int):
                raise TypeError(
                    f"star_pass trip must be None or int, not {type(value).__name__}"
                )
            if self._no_pivot:
                raise RuntimeError("a star pass cannot occur if there is no pivot")
            self._star_pass = value

        @property
        def trips(self) -> tuple[int]:
            return tuple(self._trips)

        @property
        def timestamps(self) -> tuple[datetime]:
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

    def __init__(self, parent_bout: Bout) -> None:
        if not isinstance(parent_bout, Bout):
            raise TypeError(
                f"parent_bout must be Bout, not {type(parent_bout).__name__}"
            )
        self._parent_bout: Bout = parent_bout
        self._home: Jam.Data = Jam.Data()
        self._away: Jam.Data = Jam.Data()

    @property
    def home(self) -> Data:
        return self._home

    @property
    def away(self) -> Data:
        return self._away

    @property
    def lead(self) -> None | Team:
        if self._home.lead and not self._home.lost:
            return self._parent_bout._home
        elif self._away.lead and not self._away.lost:
            return self._parent_bout._away
        else:
            return None

    @lead.setter
    def lead(self, team: Team) -> None:
        if not isinstance(team, Team):
            raise TypeError(f"team must be Team, not {type(team).__name__}")
        if team not in (self._parent_bout._home, self._parent_bout._away):
            raise ValueError("team must be playing in this Bout")
        if self.lead is not None and self.lead is not team:
            raise RuntimeError("there already is a lead jammer in this jam")
        jam_team: Jam.Data = (
            self._home if team is self._parent_bout._home else self._away
        )
        if jam_team.lost:
            raise RuntimeError("this team's jammer is not eligible for lead")
        jam_team._lead = True

    def revoke_lead(self, team: Team) -> None:
        if not isinstance(team, Team):
            raise TypeError(f"team must be Team, not {type(team).__name__}")
        if team not in (self._parent_bout._home, self._parent_bout._away):
            raise ValueError("team must be playing in this Bout")
        jam_team: Jam.Data = (
            self._home if team is self._parent_bout._home else self._away
        )
        jam_team._lost = True


class JamManager:
    def __init__(self, parent_bout: Bout) -> None:
        self._parent_bout: Bout = parent_bout
        self._current_half: int = 0
        self._jams: tuple[list[Jam]] = ([Jam(parent_bout)], [Jam(parent_bout)])

    def __getitem__(self, key: tuple[int]) -> Jam:
        half, jam = key
        return self._jams[half][jam]

    def __len__(self) -> int:
        return len(self._jams[self._current_half])

    @property
    def current(self) -> Jam:
        return self._jams[self._current_half][-1]

    def add(self):
        self._jams[self._current_half].append(Jam(self))

    def remove(self) -> None:
        if len(self._jams[self._current_half]) <= 1:
            raise RuntimeError("each half must have at least one Jam")
        del self._jams[self._current_half][-1]


class Bout:
    def __init__(self) -> None:
        self._home: Team = Team(self)
        self._away: Team = Team(self)
        self._jams: JamManager = JamManager(self)

    def __len__(self) -> int:
        return len(self._jams[self._current_half])

    @property
    def home(self) -> Team:
        return self._home

    @property
    def away(self) -> Team:
        return self._away

    @property
    def jams(self) -> JamManager:
        return self._jams


""" TODO
- game.teams.home
- game.roster.home/away    -- done
- game.jam.home/away       -- done
- game.timers
- game.lineups.home/away   
- game.penalties.home/away
"""

bout = Bout()
print(bout.jams.current)
print(bout.jams[0, 0])

bout.jams.current.lead = bout.home
bout.jams[0, 0].home.add_trip()
bout.jams.add()

print(bout.jams)
