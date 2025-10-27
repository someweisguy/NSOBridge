from dataclasses import dataclass
from datetime import datetime
from functools import cached_property
from typing import Final

from commands import Bout, Clock, Command, Jam
from commands._commands import MultiCommand
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
    return period_num, jam_num


@dataclass
class BeginPeriod(MultiCommand):
    bout: GenericBoutModel

    @cached_property
    def commands(self) -> tuple[Command, ...]:
        commands: list[Command] = []

        if self.bout.get_state() != 'stopped':
            raise RuntimeError('The Bout cannot be started now')

        home, away = self.bout.teams[:2]
        period_num, jam_num = get_next_jam_num(self.bout, True)
        jam: JamModel = JamModel(period_num, jam_num, home, away)
        commands.append(Bout.AddJam(self.bout, jam))

        commands.append(Bout.SetIsRunning(self.bout, True))

        if self.bout.get_period() < NUM_PERIODS:
            commands.append(Clock.Reset(self.bout.clock))

        return tuple(commands)


@dataclass
class EndPeriod(MultiCommand):
    bout: GenericBoutModel
    timestamp: datetime

    @cached_property
    def commands(self) -> tuple[Command, ...]:
        commands: list[Command] = []

        if self.bout.is_running and self.bout.get_state() != 'lineup':
            raise RuntimeError('The Bout cannot be stopped now')

        # TODO: Figure out a method to forfeit a Bout

        if not self.bout.is_running and self.bout.get_period() >= NUM_PERIODS:
            # Two EndPeriod commands in a row finalizes the bout
            commands.append(Bout.SetIsFinal(self.bout, True))
        elif not self.bout.is_running:
            raise RuntimeError('The Bout cannot be ended yet')

        # End the Period
        if self.bout.clock.is_running():
            commands.append(Clock.Stop(self.bout.clock, self.timestamp))
        commands.append(Bout.SetIsRunning(self.bout, False))

        return tuple(commands)


@dataclass
class StartJam(MultiCommand):
    bout: GenericBoutModel
    timestamp: datetime

    @cached_property
    def commands(self) -> tuple[Command, ...]:
        commands: list[Command] = []

        jam: JamModel
        if not self.bout.is_running:
            # FIXME: make this a call to BeginPeriod.commands
            home, away = self.bout.teams[:2]
            period_num, jam_num = get_next_jam_num(self.bout, True)
            jam = JamModel(period_num, jam_num, home, away)
            commands.append(Bout.AddJam(self.bout, jam))

            commands.append(Bout.SetIsRunning(self.bout, True))

            if self.bout.get_period() < NUM_PERIODS:
                commands.append(Clock.Reset(self.bout.clock))
        elif self.bout.get_state() == 'lineup':
            jam = self.bout.jams[-1]
        else:
            raise RuntimeError('The Jam cannot be started now')

        commands.append(Jam.JamStart(jam, self.timestamp))
        if not self.bout.clock.is_running() and self.bout.get_period() < NUM_PERIODS:
            commands.append(Clock.Start(self.bout.clock, self.timestamp))

        return tuple(commands)


@dataclass
class StopJam(MultiCommand):
    bout: GenericBoutModel
    timestamp: datetime

    @cached_property
    def commands(self) -> tuple[Command, ...]:
        commands: list[Command] = []
        if self.bout.get_state() != 'jam':
            raise RuntimeError('There is no active Jam to stop')

        commands.append(Jam.JamStop(self.bout.jams[-1], self.timestamp))

        home, away = self.bout.teams[:2]
        period_num, jam_num = get_next_jam_num(self.bout)
        jam: JamModel = JamModel(period_num, jam_num, home, away)
        commands.append(Bout.AddJam(self.bout, jam))

        return tuple(commands)
