from __future__ import annotations
from derby.clock import Clock
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from derby.bout import Bout


class ClockHelper:
    __slots__ = '_bout'

    def __init__(self, bout: Bout) -> None:
        self._bout = bout

    def __getitem__(self, name: str) -> Clock:
        match name:
            case 'jam': return self.bout._jam_clock
            case 'lineup': return self.bout._lineup_clock
            case 'period': return self.bout._period_clock
            case 'intermission': return self.bout._intermission_clock
            case 'timeout': return self.bout._timeout_clock
            case _: raise ValueError(f'Clock \'{name}\' does not exist')

    @property
    def bout(self) -> Bout:
        return self._bout

    @property
    def jam(self) -> Clock:
        return self.bout._jam_clock

    @property
    def lineup(self) -> Clock:
        return self.bout._lineup_clock

    @property
    def period(self) -> Clock:
        return self.bout._period_clock

    @property
    def intermission(self) -> Clock:
        return self.bout._intermission_clock

    @property
    def timeout(self) -> Clock:
        return self.bout._timeout_clock

    def get_clock(self, type: str) -> Clock:
        return self[type]
