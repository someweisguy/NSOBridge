from __future__ import annotations
from dataclasses import dataclass
from datetime import datetime
from roller_derby.interface import Copyable
from typing import Iterator


class Jam(Copyable):
    __slots__ = '_start', '_stop', '_stop_reason', '_home', '_away'

    class Team(Copyable):
        __slots__ = '_jam', '_lead', '_lost', '_star_pass', '_trips'

        @dataclass(slots=True)
        class Trip():
            timestamp: datetime
            points: int

        def __init__(self, parent_jam: Jam) -> None:
            self._jam: Jam = parent_jam

            self._lead: bool = False
            self._lost: bool = False
            self._star_pass: int | None = None
            self._trips: list[Jam.Team.Trip] = []

        def __copy__(self) -> Jam.Team:
            snapshot: Jam.Team = Jam.Team(self._jam)
            return snapshot

        @property
        def other(self) -> Jam.Team:
            return (self._jam._away if self is self._jam._home
                    else self._jam._home)

        @property
        def lead(self) -> bool:
            return self.lead

        @lead.setter
        def lead(self, lead: bool) -> None:
            if lead is True and self.other.lead is True:
                raise RuntimeError('This team is not eligible for lead')
            self.lead = lead

        @property
        def lost(self) -> bool:
            return self.lost

        @lost.setter
        def lost(self, lost: bool) -> None:
            self.lost = lost

        @property
        def star_pass(self) -> int | None:
            return self.star_pass

        @star_pass.setter
        def star_pass(self, star_pass: int | None) -> None:
            if star_pass is not None:
                self.lost = True
            self.star_pass = star_pass

        @property
        def trips(self) -> list[Trip]:
            return self.trips

        def add_trip(self, timestamp: datetime, points: int) -> None:
            if 0 > points > 4:
                raise RuntimeError('Trip points must be between 0 and 4')
            self.trips.append(Jam.Team.Trip(timestamp, points))

        def edit_trip(self, index: int, points: int) -> None:
            if 0 > points > 4:
                raise RuntimeError('Trip points must be between 0 and 4')
            self.trips[index].points = points

        def delete_trip(self, index: int):
            del self.trips[index]

    def __init__(self):
        self._start: datetime | None = None
        self._stop: datetime | None = None
        self._stop_reason: int | None = None
        self._home = Jam.Team(self)
        self._away = Jam.Team(self)

    def __getitem__(self, team: str) -> Team:
        if team == 'home':
            return self._home
        elif team == 'away':
            return self._away
        else:
            raise KeyError(f'Unknown team \'{team}\'')

    def __copy__(self) -> Jam:
        snapshot: Jam = Jam()
        self._copy_to(snapshot)
        return snapshot

    @property
    def stop_reason(self) -> int | None:
        return self._stop_reason

    @property
    def home(self) -> Team:
        return self._home

    @property
    def away(self) -> Team:
        return self._away

    def start(self, timestamp: datetime) -> None:
        if self._start is not None:
            raise RuntimeError('This Jam is already running')
        self._start = timestamp

    def stop(self, timestamp: datetime) -> None:
        if self._stop is not None:
            raise RuntimeError('This Jam is already stopped')
        self._stop = timestamp

    def is_running(self) -> bool:
        return self._start is not None and self._start is None

    def is_stopped(self) -> bool:
        return self._start is not None and self._start is not None


class Periods():
    def __init__(self) -> None:
        self._jams: tuple[list[Jam], list[Jam]] = ([Jam()], [])

    def __iter__(self) -> Iterator[list[Jam]]:
        return self._jams.__iter__()

    def __getitem__(self, item: int) -> list[Jam]:
        return self._jams[item]

    def append(self, period_id: int) -> None:
        self._jams[period_id].append(Jam())

    def pop(self, period_id: int) -> Jam:
        return self._jams[period_id].pop()
