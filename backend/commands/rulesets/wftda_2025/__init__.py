from datetime import datetime
from typing import Final

from commands import Bout, Clock
from commands._commands import AggregateCommand
from models import GenericBoutModel

NUM_PERIODS: Final[int] = 2


class BeginPeriod(AggregateCommand):
    def __init__(self, bout: GenericBoutModel) -> None:
        super().__init__()

        if bout.get_state() != 'stopped':
            raise RuntimeError('The Bout cannot be started now')

        self.add(Bout.JamCreate(bout, bout.teams[0], bout.teams[1], True))
        self.add(Bout.PeriodBegin(bout))

        if bout.get_period() < NUM_PERIODS:
            self.add(Clock.Reset(bout.clock))


class EndPeriod(AggregateCommand):
    def __init__(self, bout: GenericBoutModel, timestamp: datetime) -> None:
        super().__init__()

        if bout.is_running and bout.get_state() != 'lineup':
            raise RuntimeError('The Bout cannot be stopped now')

        # TODO: Figure out a method to forfeit a Bout

        if not bout.is_running and bout.get_period() >= NUM_PERIODS:
            # Two EndPeriod commands in a row finalizes the bout
            self.add(Bout.SetIsFinal(bout, True))
        elif not bout.is_running:
            raise RuntimeError('The Bout cannot be ended yet')

        # End the Period
        if bout.clock.is_running():
            self.add(Clock.Stop(bout.clock, timestamp))
        self.add(Bout.PeriodEnd(bout))


class StartJam(AggregateCommand):
    def __init__(self, bout: GenericBoutModel, timestamp: datetime) -> None:
        super().__init__()

        if not bout.is_running:
            self.add(BeginPeriod(bout))  # Handle immediate game start
        elif bout.get_state() != 'lineup':
            raise RuntimeError('The Jam cannot be started now')

        self.add(Bout.JamStart(bout, timestamp))
        if not bout.clock.is_running() and bout.get_period() < NUM_PERIODS:
            self.add(Clock.Start(bout.clock, timestamp))


class StopJam(AggregateCommand):
    def __init__(self, bout: GenericBoutModel, timestamp: datetime) -> None:
        super().__init__()

        if bout.get_state() != 'jam':
            raise RuntimeError('There is no active Jam to stop')

        self.add(Bout.JamStop(bout, timestamp))
        self.add(Bout.JamCreate(bout, bout.teams[0], bout.teams[1]))
