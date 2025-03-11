from dataclasses import dataclass, field
from datetime import datetime, timedelta


@dataclass(slots=True)
class Clock:
    start: datetime | None = None
    elapsed: timedelta = timedelta(seconds=0)
    alarm: timedelta | None = None


@dataclass(slots=True)
class Timer:
    _game: Clock = field(default_factory=Clock)
    _jam: Clock = field(default_factory=Clock)
    is_in_intermission: bool = True
    is_in_lineup: bool = False

    @property
    def game(self) -> Clock:
        return self._game

    @property
    def jam(self) -> Clock:
        return self._jam
