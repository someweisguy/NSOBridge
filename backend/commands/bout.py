from datetime import datetime
from typing import override

from models import GenericBoutModel, JamModel
from models.time import TimeoutModel
from sqlalchemy.ext.asyncio import AsyncSession

from .commands import Command


class BoutSetIsRunning(Command):
    def __init__(self, bout: GenericBoutModel, is_running: bool) -> None:
        self.bout: GenericBoutModel = bout
        self.new_value: bool = is_running
        self.old_value: bool = bout.is_running

    @override
    def execute(self, db: AsyncSession) -> None:
        if self.bout.get_state() == 'final':
            raise RuntimeError('Cannot update a Period if the Bout has been finalized')
        elif self.bout.get_state() != 'lineup' and not self.new_value:
            raise RuntimeError('The Period cannot be ended right now')
        self.bout.is_running = self.new_value

    @override
    async def undo(self, db: AsyncSession) -> None:
        if self.bout.get_state() == 'final':
            raise RuntimeError('Cannot update a Period if the Bout has been finalized')
        elif self.bout.get_state() != 'lineup' and not self.old_value:
            raise RuntimeError('The Period cannot be ended right now')
        self.bout.is_running = self.old_value


class BoutSetPeriodStartTimestamp(Command):
    def __init__(
        self, bout: GenericBoutModel, start_timestamp: datetime | None
    ) -> None:
        self.bout: GenericBoutModel = bout
        self.new_value: datetime | None = start_timestamp
        self.old_value: datetime | None = bout.expected_start_timestamp

    @override
    def execute(self, db: AsyncSession) -> None:
        self.bout.expected_start_timestamp = self.new_value

    @override
    async def undo(self, db: AsyncSession) -> None:
        self.bout.expected_start_timestamp = self.old_value


class BoutSetFinal(Command):
    def __init__(self, bout: GenericBoutModel, is_final: bool) -> None:
        self.bout: GenericBoutModel = bout
        self.new_value: bool = is_final
        self.old_value: bool = bout.is_final

    @override
    def execute(self, db: AsyncSession) -> None:
        if self.bout.get_state() != 'lineup' and self.new_value:
            raise RuntimeError('The Bout cannot be finalized right now')
        self.bout.is_final = self.new_value

    @override
    async def undo(self, db: AsyncSession) -> None:
        if self.bout.get_state() != 'lineup' and self.old_value:
            raise RuntimeError('The Bout cannot be finalized right now')
        self.bout.is_final = self.old_value


class BoutStartTimeout(Command):
    def __init__(self, bout: GenericBoutModel, timestamp: datetime) -> None:
        self.bout: GenericBoutModel = bout
        self.timestamp: datetime = timestamp
        self.timeout: TimeoutModel | None = None

    @override
    def execute(self, db: AsyncSession) -> None:
        latest_jam: JamModel | None = self.bout.get_latest_played_jam()
        if latest_jam is None:
            raise RuntimeError('A Timeout cannot be called until the Bout has started')
        if self.timeout is None:
            self.timeout = TimeoutModel(
                jam=latest_jam,
                start_timestamp=self.timestamp,
                clock_elapsed=self.bout.clock.get_duration(self.timestamp),
            )

        # Protect against redoing this command if the bout state is invalid
        if self.timeout.jam.id != latest_jam.id:
            raise RuntimeError('Cannot start Timeout; Bout state is invalid')

        self.bout.timeouts.append(self.timeout)

    @override
    async def undo(self, db: AsyncSession) -> None:
        if self.timeout not in self.bout.timeouts:
            raise RuntimeError('Cannot undo start Timeout; Timeout does not exist')
        self.bout.timeouts.remove(self.timeout)
        await db.delete(self.timeout)


class BoutStopTimeout(Command):
    def __init__(self, bout: GenericBoutModel, timestamp: datetime) -> None:
        self.bout: GenericBoutModel = bout
        self.timestamp: datetime = timestamp
        self.timeout: TimeoutModel | None = None

    @override
    def execute(self, db: AsyncSession) -> None:
        if self.bout.get_state() != 'timeout':
            raise RuntimeError('There is no active Timeout to stop')
        if self.timeout is None:
            if len(self.bout.timeouts) == 0:
                raise RuntimeError('There is no Timeout to stop')
            self.timeout = self.bout.timeouts[-1]

        # Protect against redoing this command if the bout state is invalid
        if self.timeout.jam.id != self.bout.timeouts[-1].jam.id:
            raise RuntimeError('Cannot undo stop Timeout; Bout state is invalid')

        self.timeout.stop(self.timestamp)

        # TODO: move this to its own command
        # # Decrement the Timeout or Official Review if it was not retained
        # if self.timeout.team is not None and not self.timeout.retained:
        #     # Only decrement if the value is greater than zero
        #     if self.timeout.is_review and self.timeout.team.reviews_remaining > 0:
        #         self.timeout.team.reviews_remaining -= 1
        #     elif self.timeout.team.timeouts_remaining > 0:
        #         self.timeout.team.timeouts_remaining -= 1

    @override
    async def undo(self, db: AsyncSession) -> None:
        assert self.timeout is not None
        if (self.timeout.id != self.bout.timeouts[-1].id):
            raise RuntimeError('Cannot undo stop Timeout; Bout state is invalid')
        self.timeout.stop_timestamp = None
