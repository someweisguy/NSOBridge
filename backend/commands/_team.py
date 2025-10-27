from typing import override

from models import TeamModel
from sqlalchemy.ext.asyncio import AsyncSession

from ._commands import Command


class SetTimeoutsRemaining(Command):
    def __init__(self, team: TeamModel, timeouts_remaining: int) -> None:
        self.detached_team: TeamModel = team
        self.new_value: int = timeouts_remaining
        self.old_value: int = 0

    @override
    async def execute(self, session: AsyncSession) -> None:
        team: TeamModel = await session.merge(self.detached_team)
        self.old_value = team.timeouts_remaining
        team.timeouts_remaining = self.new_value

    @override
    async def undo(self, session: AsyncSession) -> None:
        team: TeamModel = await session.merge(self.detached_team)
        team.timeouts_remaining = self.old_value


class SetReviewsRemaining(Command):
    def __init__(self, team: TeamModel, reviews_remaining: int) -> None:
        self.detached_team: TeamModel = team
        self.new_value: int = reviews_remaining
        self.old_value: int = 0

    @override
    async def execute(self, session: AsyncSession) -> None:
        team: TeamModel = await session.merge(self.detached_team)
        self.old_value = team.reviews_remaining
        team.reviews_remaining = self.new_value

    @override
    async def undo(self, session: AsyncSession) -> None:
        team: TeamModel = await session.merge(self.detached_team)
        team.reviews_remaining = self.old_value
