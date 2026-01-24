"""The Roster and Skater model and associated business logic."""

from __future__ import annotations

from typing import TYPE_CHECKING, override
from uuid import UUID  # noqa: TC003

from core import CASCADE_OTHER, BaseSQLModel
from game.models import CacheableSQLModel, CacheKey
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from game.teams.models import BaseTeam


class Skater(BaseSQLModel):
    """Represent a singular Skater in roller derby."""

    team_uuid: Mapped[UUID] = mapped_column(ForeignKey('teams.uuid'))
    name: Mapped[str] = mapped_column()
    pronouns: Mapped[str] = mapped_column()  # TODO: Implement pronouns
    number: Mapped[str] = mapped_column()

    _team: Mapped[BaseTeam] = relationship(
        cascade=CASCADE_OTHER,
        foreign_keys=[team_uuid],
    )

    __tablename__: str = 'skaters'

    def __init__(self, name: str, number: str) -> None:
        """Initialize a Skater.

        Args:
            name (str): The roller derby name of this Skater. This should not be the
            legal name of this Skater.
            number (str): The number of this skater. This value is represented as a
            `str` because Skater number are allowed to include characters and because
            numbers with leading zeroes should be considered distinct from numbers
            without leading zeroes, e.g. `007 != 7`.

        """
        super().__init__(name=name, number=number)

    @override
    async def get_parents(self) -> tuple[BaseSQLModel, ...]:
        return (await self.get_team(),)

    async def get_team(self) -> BaseTeam:
        """Get the Team to which this Skater belongs.

        Returns:
            BaseTeam: the Team to which this Skater belongs.

        """
        return await self.awaitable_attrs._team


class Roster(CacheableSQLModel):
    """Represent a Roster of skaters."""

    name: Mapped[str] = mapped_column()
    league: Mapped[str] = mapped_column()
    mnemonic: Mapped[str] = mapped_column()

    __tablename__: str = 'rosters'

    def __init__(self, name: str, league: str, mnemonic: str = '') -> None:
        """Initialize a Roster.

        Args:
            name (str): the name of this Roster.
            league (str): the league to which this Roster belongs.
            mnemonic (str, optional): a three to four letter mnemonic of this Roster's
            name. When no mnemonic is provided, one will be automatically generated.
            Defaults to ''.

        Raises:
            ValueError: if a blank Team name is provided.

        """
        name = name.strip()
        if name == '':
            raise ValueError('Team name cannot be blank')
        mnemonic = mnemonic.strip()
        if mnemonic == '':
            pass  # TODO: Implement team name mnemonic algorithm
        super().__init__(name=name, league=league, mnemonic=mnemonic)

    @override
    async def cache_key(self) -> CacheKey:
        return (self.__tablename__, self.uuid)

    @override
    async def get_parents(self) -> tuple[BaseSQLModel, ...]:
        return ()
