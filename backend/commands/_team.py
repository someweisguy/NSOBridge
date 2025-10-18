from typing import override

from models import TeamModel
from sqlalchemy.ext.asyncio import AsyncSession

from ._commands import Command


class SetTimeoutsRemaining(Command):
    def __init__(self, team: TeamModel, new_value: int) -> None:
        self.team: TeamModel = team
        self.new_value: int = new_value
        self.old_value: int = team.timeouts_remaining

    @override
    async def execute(self, db: AsyncSession) -> None:
        self.team.timeouts_remaining = self.new_value

    @override
    async def undo(self, db: AsyncSession) -> None:
        self.team.timeouts_remaining = self.old_value


class SetReviewsRemaining(Command):
    def __init__(self, team: TeamModel, new_value: int) -> None:
        self.team: TeamModel = team
        self.new_value: int = new_value
        self.old_value: int = team.reviews_remaining

    @override
    async def execute(self, db: AsyncSession) -> None:
        self.team.reviews_remaining = self.new_value

    @override
    async def undo(self, db: AsyncSession) -> None:
        self.team.reviews_remaining = self.old_value
