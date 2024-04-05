from datetime import datetime


class Jam:
    TEAMS: set[str] = frozenset({"home", "away"})

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

    def __init__(self) -> None:
        self._home: Jam.Data = Jam.Data()
        self._away: Jam.Data = Jam.Data()

    @property
    def home(self) -> Data:
        return self._home

    @property
    def away(self) -> Data:
        return self._away

    @property
    def lead(self) -> None | str:
        if self._home.lead and not self._home.lost:
            return "home"
        elif self._away.lead and not self._away.lost:
            return "away"
        else:
            return None

    @lead.setter
    def lead(self, team: str) -> None:
        team = team.lower()
        if team not in Jam.TEAMS:
            raise ValueError(f"team must be one of 'home' or 'away', not {team}")
        if self.lead is not None and self.lead != team:
            raise RuntimeError("there already is a lead jammer in this jam")

        # Ensure the team is eligible for lead and set the lead flag
        jam_team: Jam.Data = self._home if team == "home" else self._away
        if jam_team.lost:
            raise RuntimeError("this team's jammer is not eligble for lead")
        jam_team._lead = True

    def revoke_lead(self, team: str) -> None:
        team = team.lower()
        if team not in Jam.TEAMS:
            raise ValueError(f"team must be one of 'home' or 'away', not {team}")

        # Set the lost lead flag
        jam_team: Jam.Data = self._home if team == "home" else self._away
        jam_team._lost = True


class JamManager:
    def __init__(self) -> None:
        self._current_half: int = 0
        self._jams: tuple[list[Jam]] = ([Jam()], [Jam()])

    def __getitem__(self, key: tuple[int]) -> Jam:
        half, jam = key
        return self._jams[half][jam]

    def __len__(self) -> int:
        return len(self._jams[self._current_half])

    @property
    def current(self) -> Jam:
        return self._jams[self._current_half][-1]

    def add(self):
        self._jams[self._current_half].append(Jam())

    def remove(self) -> None:
        if len(self._jams[self._current_half]) <= 1:
            raise RuntimeError("each half must have at least one Jam")
        del self._jams[self._current_half][-1]
