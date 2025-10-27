from datetime import datetime
from typing import Final

from commands import Bout, Clock, Jam
from commands._commands import AggregateCommand
from models import GenericBoutModel, JamModel

NUM_PERIODS: Final[int] = 2


def get_next_jam_num(
    bout: GenericBoutModel, create_new_period: bool = False
) -> tuple[int, int]:
    period_num: int = 0
    jam_num: int = 0
    if len(bout.jams) > 0:
        latest: JamModel = bout.jams[-1]
        period_num = latest.period
        if create_new_period:
            period_num += 1
        else:
            jam_num = latest.jam + 1
    return (jam_num, period_num)


class BeginPeriod(AggregateCommand):
    def __init__(self, bout: GenericBoutModel) -> None:
        super().__init__()

        if bout.get_state() != 'stopped':
            raise RuntimeError('The Bout cannot be started now')

        home, away = bout.teams[:2]
        period_num, jam_num = get_next_jam_num(bout, True)
        jam: JamModel = JamModel(period_num, jam_num, home, away)
        self.add(Jam.JamAdd(bout, jam))

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

        jam: JamModel
        if not bout.is_running:
            home, away = bout.teams[:2]
            period_num, jam_num = get_next_jam_num(bout, True)
            jam = JamModel(period_num, jam_num, home, away)
            self.add(Jam.JamAdd(bout, jam))

            self.add(Bout.PeriodBegin(bout))

            if bout.get_period() < NUM_PERIODS:
                self.add(Clock.Reset(bout.clock))
        elif bout.get_state() == 'lineup':
            jam = bout.jams[-1]
        else:
            raise RuntimeError('The Jam cannot be started now')

        self.add(Jam.JamStart(jam, timestamp))
        if not bout.clock.is_running() and bout.get_period() < NUM_PERIODS:
            self.add(Clock.Start(bout.clock, timestamp))


class StopJam(AggregateCommand):
    def __init__(self, bout: GenericBoutModel, timestamp: datetime) -> None:
        super().__init__()

        if bout.get_state() != 'jam':
            raise RuntimeError('There is no active Jam to stop')

        self.add(Jam.JamStop(bout.jams[-1], timestamp))

        home, away = bout.teams[:2]
        period_num, jam_num = get_next_jam_num(bout)
        jam: JamModel = JamModel(period_num, jam_num, home, away)
        self.add(Jam.JamAdd(bout, jam))


class StartTimeout(AggregateCommand):
    def __init__(self, bout: GenericBoutModel, timestamp: datetime) -> None:
        super().__init__()

        self.add(Bout.TimeoutStart(bout, timestamp))

        if bout.clock.is_running():
            self.add(Clock.Stop(bout.clock, timestamp))


class StopTimeout(AggregateCommand):
    def __init__(self, bout: GenericBoutModel, timestamp: datetime) -> None:
        super().__init__()

        self.add(Bout.TimeoutStop(bout, timestamp))

        # TODO: reduce team timeout count
