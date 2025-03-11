from gc import get_referents
from types import ModuleType, FunctionType
import sys
from dataclasses import dataclass, field
from uuid import UUID, uuid4

from datetime import datetime, timedelta
from abc import ABC, abstractmethod

from typing import Any, Literal

'''
'_period_clock', '_intermission_clock', '_lineup_clock',
                 '_jam_clock', '_timeout_clock', '_jams', '_timeouts_remaining',
                 '_official_reviews_remaining', '_timeouts', '_score_state',
                 '_is_overtime')
'''

type JAM_STOP_REASONS = Literal['called', 'time', 'injury', 'other']



class TeamAttribute[T: Any]:
    __slots__ = '_home', '_away'
    
    def __init__(self, home: T, away: T) -> None:
        self._home: T = home
        self._away: T = away

    @property
    def home(self) -> T:
        return self._home

    @property
    def away(self) -> T:
        return self._away

    def __getitem__(self, item: Literal['home', 'away']) -> T:
        return getattr(self, item)


@dataclass(slots=True)
class Trip:
    points: int
    timestamp: datetime


@dataclass(slots=True)
class Score:
    lead: bool = False
    lost: bool = False
    star_pass: int | None = None
    _trips: list[Trip] = field(default_factory=list)

    @property
    def trips(self) -> list[Trip]:
        return self._trips


@dataclass(slots=True)
class Jam:
    start_timestamp: datetime | None = None
    stop_timestamp: datetime | None = None
    stop_reason: JAM_STOP_REASONS | None = None
    _score: TeamAttribute[Score] = TeamAttribute(Score(), Score())

    @property
    def score(self) -> TeamAttribute[Score]:
        return self._score


@dataclass(slots=True)
class Clock:
    start: datetime | None = None
    elapsed: timedelta = timedelta(seconds=0)
    alarm: timedelta | None = None


@dataclass(slots=True)
class BoutModel:
    _game_clock: Clock = field(default_factory=Clock)
    _jam_clock: Clock = field(default_factory=Clock)
    _timeout_clock: Clock = field(default_factory=Clock)
    is_in_lineup: bool = False
    is_in_intermission: bool = True
    _jams: tuple[list[Jam], list[Jam]] = ([Jam()], [])
    _timeouts_remaining: TeamAttribute[int] = TeamAttribute(3, 3)
    _official_reviews_remaining: TeamAttribute[int] = TeamAttribute(1, 1)
    
    def __post_init__(self):      
        self.jams[0].extend([Jam() for _ in range(100)])        
        for jam in self.jams[0]:
            for _ in range(7):
                jam.score.home.trips.append(Trip(0, datetime.now()))
                jam.score.away.trips.append(Trip(0, datetime.now()))

    @property
    def game_clock(self) -> Clock:
        return self._game_clock

    @property
    def jam_clock(self) -> Clock:
        return self._jam_clock

    @property
    def timeout_clock(self) -> Clock:
        return self._timeout_clock

    @property
    def jams(self) -> tuple[list[Jam], list[Jam]]:
        return self._jams

    @property
    def timeouts_remaining(self) -> TeamAttribute[int]:
        return self._timeouts_remaining

    @property
    def official_reviews_remaining(self) -> TeamAttribute[int]:
        return self._official_reviews_remaining


class BoutHandler:
    def __init__(self, model: BoutModel | None = None):
        self._id: UUID = uuid4()
        self._model: BoutModel = model or BoutModel()

    @property
    def id(self) -> UUID:
        return self._id

    @property
    def model(self) -> BoutModel:
        return self._model


class AbstractCommand(ABC):
    __slots__ = '_bout_id', '_client_id', '_timestamp'

    def __init__(self, bout_id: UUID | None, client_id: UUID,
                 timestamp: datetime) -> None:
        self._bout_id: UUID | None = bout_id
        self._client_id: UUID = client_id
        self._timestamp: datetime = timestamp

    @property
    def bout_id(self) -> UUID:
        return self._bout_id

    @property
    def client_id(self) -> UUID:
        return self._client_id

    @property
    def timestamp(self) -> datetime:
        return self._timestamp

    @abstractmethod
    def execute(self) -> None:
        raise NotImplementedError()


class TripAdded(AbstractCommand):
    def __init__(self, bout_id, client_id, timestamp):
        super().__init__(bout_id, client_id, timestamp)


'''

boutId: zzz
clientId: xxx
event: tripAdded
timestamp: 2021-10-10T00:00:00.000Z
data: {
  jamId: [0, 0],
  team: 'home',
  tripIndex: 0,
  points: 0
}

'''

# Custom objects know their class.
# Function objects seem to know way too much, including modules.
# Exclude modules as well.
BLACKLIST = type, ModuleType, FunctionType


def getsize(obj):
    """sum size of object & members."""
    if isinstance(obj, BLACKLIST):
        raise TypeError(
            'getsize() does not take argument of type: ' + str(type(obj)))
    seen_ids = set()
    size = 0
    objects = [obj]
    while objects:
        need_referents = []
        for obj in objects:
            if not isinstance(obj, BLACKLIST) and id(obj) not in seen_ids:
                seen_ids.add(id(obj))
                size += sys.getsizeof(obj)
                need_referents.append(obj)
        objects = get_referents(*need_referents)
    return size

b = BoutModel()
print(getsize(b))
