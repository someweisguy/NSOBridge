from dataclasses import dataclass
from typing import Annotated, override

from fastapi import Body
from models import DatabaseCommand, TeamModel
from sqlalchemy.ext.asyncio import AsyncSession


@dataclass
class SetTimeoutsRemaining(DatabaseCommand):
    detached_team: TeamModel
    new_value: Annotated[int, Body()]
    old_value: Annotated[int, Body(include_in_schema=False)] = 0

    @override
    async def execute(self, session: AsyncSession) -> None:
        team: TeamModel = await session.merge(self.detached_team)
        self.old_value = team.timeouts_remaining
        team.timeouts_remaining = self.new_value

    @override
    async def undo(self, session: AsyncSession) -> None:
        team: TeamModel = await session.merge(self.detached_team)
        team.timeouts_remaining = self.old_value


@dataclass
class SetReviewsRemaining(DatabaseCommand):
    detached_team: TeamModel
    new_value: Annotated[int, Body()]
    old_value: Annotated[int, Body(include_in_schema=False)] = 0

    @override
    async def execute(self, session: AsyncSession) -> None:
        team: TeamModel = await session.merge(self.detached_team)
        self.old_value = team.reviews_remaining
        team.reviews_remaining = self.new_value

    @override
    async def undo(self, session: AsyncSession) -> None:
        team: TeamModel = await session.merge(self.detached_team)
        team.reviews_remaining = self.old_value
