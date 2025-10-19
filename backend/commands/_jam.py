from datetime import datetime
from typing import override

from models import TeamJamModel
from models.jam import TripModel
from sqlalchemy.ext.asyncio import AsyncSession

from commands._commands import Command


class AddTrip(Command):
    def __init__(
        self, team_jam: TeamJamModel, passes: int, timestamp: datetime
    ) -> None:
        assert team_jam.team is not None and team_jam.team.bout is not None
        points_per_trip: int = team_jam.team.bout.context.points_per_trip
        if 0 > passes > points_per_trip:
            raise ValueError(f"""Number of passes must be {points_per_trip}
                             or less ({passes=})""")

        self.team_jam: TeamJamModel = team_jam
        self.trip: TripModel = TripModel(timestamp=timestamp, passes=passes)

    @override
    async def execute(self, db: AsyncSession) -> None:
        self.team_jam.trips.append(self.trip)

    @override
    async def undo(self, db: AsyncSession) -> None:
        await db.delete(self.trip)


# TODO: DeleteTrip


class SetLead(Command):
    def __init__(self, team_jam: TeamJamModel, lead: datetime | None) -> None:
        self.team_jam: TeamJamModel = team_jam
        self.new_value: datetime | None = lead
        self.old_value: datetime | None = team_jam.lead

    @override
    async def execute(self, db: AsyncSession) -> None:
        if self.get_state() != 'jam':
            raise RuntimeError('There is no active Jam to which to set Lead')

        jam: JamModel = self.jams[-1]
        if lead and jam.lead_is_declared():
            raise RulesError('A Lead Jammer has already been declared in this Jam')
        jam[team].lead = timestamp if lead else None

    @override
    async def undo(self, db: AsyncSession) -> None:
        pass  # TODO


class SetLost(Command):
    def __init__(self, team_jam: TeamJamModel, lost: datetime | None) -> None:
        self.team_jam: TeamJamModel = team_jam
        self.new_value: datetime | None = lead
        self.old_value: datetime | None = team_jam.lost

    @override
    async def execute(self, db: AsyncSession) -> None:
        if self.get_state() != 'jam':
            raise RuntimeError('There is no active Jam to which to set Lost')

        jam: JamModel = self.jams[-1]
        jam[team].lost = lost

    @override
    async def undo(self, db: AsyncSession) -> None:
        pass  # TODO


class SetStarPass(Command):
    def __init__(self, team_jam: TeamJamModel, lost: datetime | None) -> None:
        self.team_jam: TeamJamModel = team_jam
        self.new_value: datetime | None = lead
        self.old_value: datetime | None = team_jam.lost

    @override
    async def execute(self, db: AsyncSession) -> None:
        if self.get_state() != 'jam':
            raise RuntimeError('There is no active Jam to which to add a Star Pass')

        jam: JamModel = self.jams[-1]
        star_pass: StarPassModel = StarPassModel(
            timestamp=timestamp,
            trip=jam[team].trips[-1] if len(jam[team].trips) > 0 else None,
        )
        jam[team].star_passes.append(star_pass)
    @override
    async def undo(self, db: AsyncSession) -> None:
        pass  # TODO
