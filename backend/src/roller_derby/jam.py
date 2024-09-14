from __future__ import annotations
from copy import copy
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any
from interface import Copyable, Requestable


@dataclass(slots=True, eq=False)
class Trip(Requestable, Copyable):
    timestamp: datetime
    points: int

    def __copy__(self) -> Trip:
        return Trip(copy(self.timestamp), copy(self.points))

    def serve(self) -> dict[str, Any]:
        return {
            'timestamp': str(self.timestamp),
            'points': self.points
        }


@dataclass(slots=True, eq=False)
class Score(Requestable, Copyable):
    lead: bool = False
    lost: bool = False
    star_pass: int | None = None
    trips: list[Trip] = field(default_factory=list)

    def __copy__(self) -> Score:
        snapshot: Score = Score()
        self._copy_to(snapshot)
        return snapshot

    def serve(self) -> dict[str, Any]:
        return {
            'lead': self.lead,
            'lost': self.lost,
            'starPass': self.star_pass,
            'trips': [trip.serve() for trip in self.trips]
        }


class Team(Requestable, Copyable):
    __slots__ = '_jam', '_score'

    def __init__(self, parent_jam: Jam) -> None:
        self._jam: Jam = parent_jam
        self._score: Score = Score()

    def __copy__(self) -> Team:
        snapshot: Team = Team(self._jam)
        snapshot._score = copy(self._score)
        return snapshot

    @property
    def other(self) -> Team:
        return (self._jam._away if self is self._jam._home
                else self._jam._home)

    @property
    def lead(self) -> bool:
        return self._score.lead

    @lead.setter
    def lead(self, lead: bool) -> None:
        if lead is True and self.other._score.lead is True:
            raise RuntimeError('This team is not eligible for lead')
        self._score.lead = lead

    @property
    def lost(self) -> bool:
        return self._score.lost

    @lost.setter
    def lost(self, lost: bool) -> None:
        self._score.lost = lost

    @property
    def star_pass(self) -> int | None:
        return self._score.star_pass

    @star_pass.setter
    def star_pass(self, star_pass: int | None) -> None:
        if star_pass is not None:
            self.lost = True
        self._score.star_pass = star_pass

    def add_trip(self, timestamp: datetime, points: int) -> None:
        if 0 > points > 4:
            raise RuntimeError('Trip points must be between 0 and 4')
        self._score.trips.append(Trip(timestamp, points))

    def edit_trip(self, index: int, points: int) -> None:
        if 0 > points > 4:
            raise RuntimeError('Trip points must be between 0 and 4')
        self._score.trips[index].points = points

    def delete_trip(self, index: int):
        del self._score.trips[index]

    def serve(self) -> dict[str, Any]:
        return {
            'score': self._score.serve()
        }


class Jam(Copyable):
    __slots__ = '_start', '_stop', '_stop_reason', '_home', '_away'

    def __init__(self):
        self._start: datetime | None = None
        self._stop: datetime | None = None
        self._stop_reason: int | None = None
        self._home = Team(self)
        self._away = Team(self)

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

    def serve(self) -> dict[str, Any]:
        return {
            'startTimestamp': (None if self._start is None
                               else str(self._start)),
            'stopTimestamp': None if self._stop is None else str(self._stop),
            'stopReason': self._stop_reason,
            'home': self._home.serve(),
            'away': self._away.serve()
        }
