from datetime import datetime
from typing import override

from models import GenericBoutModel, JamModel, TeamJamModel, TeamModel
from models.time import TimeoutModel
from sqlalchemy.ext.asyncio import AsyncSession

from commands._commands import Command


class PeriodStartCountdown(Command):
    def __init__(
        self, bout: GenericBoutModel, start_timestamp: datetime | None
    ) -> None:
        self.bout: GenericBoutModel = bout
        self.new_value: datetime | None = start_timestamp
        self.old_value: datetime | None = bout.expected_start_timestamp

    @override
    async def execute(self, db: AsyncSession) -> None:
        self.bout.expected_start_timestamp = self.new_value

    @override
    async def undo(self, db: AsyncSession) -> None:
        self.bout.expected_start_timestamp = self.old_value


class PeriodBegin(Command):
    def __init__(self, bout: GenericBoutModel) -> None:
        self.bout: GenericBoutModel = bout

    @override
    async def execute(self, db: AsyncSession) -> None:
        if self.bout.get_state() == 'final':
            raise RuntimeError('Cannot begin a Period if the Bout has been finalized')
        self.bout.is_running = True

    @override
    async def undo(self, db: AsyncSession) -> None:
        # TODO: Prevent undo if any Jams have been added to this Period
        if self.bout.get_state() != 'lineup':
            raise RuntimeError('The Period cannot be ended right now')
        self.bout.is_running = False


class PeriodEnd(Command):
    def __init__(self, bout: GenericBoutModel) -> None:
        self.bout: GenericBoutModel = bout

    @override
    async def execute(self, db: AsyncSession) -> None:
        if self.bout.get_state() == 'final':
            raise RuntimeError('Cannot end a Period if the Bout has been finalized')
        elif self.bout.get_state() != 'lineup':
            raise RuntimeError('The Period cannot be ended right now')
        self.bout.is_running = False

    @override
    async def undo(self, db: AsyncSession) -> None:
        if self.bout.get_state() != 'stopped':
            raise RuntimeError('The Period cannot be started right now')
        self.bout.is_running = True


class SetIsFinal(Command):
    def __init__(self, bout: GenericBoutModel, is_final: bool) -> None:
        self.bout: GenericBoutModel = bout
        self.new_value: bool = is_final
        self.old_value: bool = bout.is_final

    @override
    async def execute(self, db: AsyncSession) -> None:
        if self.bout.get_state() != 'lineup' and self.new_value:
            raise RuntimeError('The Bout cannot be finalized right now')
        self.bout.is_final = self.new_value

    @override
    async def undo(self, db: AsyncSession) -> None:
        if self.bout.get_state() != 'lineup' and self.old_value:
            raise RuntimeError('The Bout cannot be finalized right now')
        self.bout.is_final = self.old_value


# TODO: class SetOrder(Command)


class JamCreate(Command):
    def __init__(
        self,
        bout: GenericBoutModel,
        home: TeamModel,
        away: TeamModel,
        create_new_period: bool = False,
    ) -> None:
        self.bout: GenericBoutModel = bout
        self.home: TeamModel = home
        self.away: TeamModel = away
        self.create_new_period: bool = create_new_period
        self.jam: JamModel | None = None

    @override
    async def execute(self, db: AsyncSession) -> None:
        # Determine what the next Jam and Period number should be
        period_num: int = 0
        jam_num: int = 0
        if len(self.bout.jams) > 0:
            latest: JamModel = self.bout.jams[-1]
            period_num = latest.period
            if self.create_new_period:
                period_num += 1
            else:
                jam_num = latest.jam + 1

        # Instantiate the Jam if it hasn't been already
        if self.jam is None:
            self.jam = JamModel(
                period=period_num,
                jam=jam_num,
                home=TeamJamModel(self.home),
                away=TeamJamModel(self.away),
            )
        elif self.jam.period != period_num or self.jam.jam != jam_num:
            # Another user has created a Jam with this Period and Jam number already
            raise RuntimeError('Bout state is invalid')

        self.bout.jams.append(self.jam)

    @override
    async def undo(self, db: AsyncSession) -> None:
        assert self.jam is not None

        # Prevent deletion of a Jam if it already has data associated with it
        if self.jam.start_timestamp is not None:
            raise RuntimeError('Jam has already started')

        # Do not remove the Jam from the Bout - just delete it from the database
        await db.delete(self.jam)


class JamStart(Command):
    def __init__(self, bout: GenericBoutModel, timestamp: datetime) -> None:
        self.bout: GenericBoutModel = bout
        self.timestamp: datetime = timestamp
        self.jam: JamModel | None = None

    @override
    async def execute(self, db: AsyncSession) -> None:
        if self.jam is None:
            self.jam = self.bout.jams[-1]

        if self.jam != self.bout.jams[-1]:
            raise RuntimeError('Invalid Bout state')

        self.jam.start(self.timestamp)

    @override
    async def undo(self, db: AsyncSession) -> None:
        assert self.jam is not None

        # Ensure that only the latest Jam is modified
        if self.jam != self.bout.jams[-1]:
            raise RuntimeError('Invalid Bout state')

        self.jam.start_timestamp = None


class JamStop(Command):
    def __init__(self, bout: GenericBoutModel, timestamp: datetime) -> None:
        self.bout: GenericBoutModel = bout
        self.timestamp: datetime = timestamp
        self.jam: JamModel | None = None

    @override
    async def execute(self, db: AsyncSession) -> None:
        if self.jam is None:
            self.jam = self.bout.jams[-1]

        # Ensure only the latest Jam is modified
        if self.jam != self.bout.jams[-1]:
            raise RuntimeError('Invalid Bout state')

        self.jam.stop(self.timestamp)

    @override
    async def undo(self, db: AsyncSession) -> None:
        assert self.jam is not None

        # Ensure that only the latest played Jam is modified
        if self.jam != self.bout.get_latest_played_jam():
            raise RuntimeError('Invalid Bout state')

        self.jam.stop_timestamp = None


class TimeoutStart(Command):
    def __init__(self, bout: GenericBoutModel, timestamp: datetime) -> None:
        self.bout: GenericBoutModel = bout
        self.timestamp: datetime = timestamp
        self.timeout: TimeoutModel | None = None

    @override
    async def execute(self, db: AsyncSession) -> None:
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
        if self.timeout.jam != latest_jam:
            raise RuntimeError('Bout state is invalid')

        self.bout.timeouts.append(self.timeout)

    @override
    async def undo(self, db: AsyncSession) -> None:
        assert self.timeout is not None
        if self.timeout not in self.bout.timeouts:
            raise RuntimeError('Timeout does not exist')
        await db.delete(self.timeout)


class TimeoutStop(Command):
    def __init__(self, bout: GenericBoutModel, timestamp: datetime) -> None:
        self.bout: GenericBoutModel = bout
        self.timestamp: datetime = timestamp
        self.timeout: TimeoutModel | None = None

    @override
    async def execute(self, db: AsyncSession) -> None:
        if self.bout.get_state() != 'timeout':
            raise RuntimeError('There is no active Timeout to stop')
        if self.timeout is None:
            if len(self.bout.timeouts) == 0:
                raise RuntimeError('There is no Timeout to stop')
            self.timeout = self.bout.timeouts[-1]

        # Protect against redoing this command if the bout state is invalid
        if self.timeout.jam != self.bout.timeouts[-1].jam:
            raise RuntimeError('Bout state is invalid')

        self.timeout.stop(self.timestamp)

    @override
    async def undo(self, db: AsyncSession) -> None:
        assert self.timeout is not None
        if self.timeout != self.bout.timeouts[-1]:
            raise RuntimeError('Bout state is invalid')
        self.timeout.stop_timestamp = None
