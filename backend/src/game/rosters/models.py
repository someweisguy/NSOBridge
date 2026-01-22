"""The Roster and Skater model and associated business logic."""

from __future__ import annotations

from typing import override

from core import CASCADE_CHILD, CASCADE_OTHER, BaseSQLModel
from game.models import CacheableSQLModel, CacheKey
from sqlalchemy import ForeignKey, column
from sqlalchemy.orm import Mapped, mapped_column, relationship


class Skater(BaseSQLModel):
    """Represent a singular Skater in roller derby."""

    roster_id: Mapped[int] = mapped_column(ForeignKey('rosters.id'))
    name: Mapped[str] = mapped_column()
    pronouns: Mapped[str] = mapped_column()  # TODO: Implement pronouns
    number: Mapped[str] = mapped_column()

    _roster: Mapped[Roster] = relationship(
        back_populates='skaters',
        cascade=CASCADE_OTHER,
        foreign_keys=[roster_id],
        lazy='selectin',
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
        return (await self.get_roster(),)

    async def get_roster(self) -> Roster:
        """Get the Roster to which this Skater belongs.

        Returns:
            Roster: the Roster to which this Skater belongs.

        """
        return await self.awaitable_attrs._roster


class Roster(CacheableSQLModel):
    """Represent a Roster of skaters."""

    name: Mapped[str] = mapped_column()
    league: Mapped[str] = mapped_column()
    mnemonic: Mapped[str] = mapped_column()

    skaters: Mapped[list[Skater]] = relationship(
        back_populates='_roster',
        cascade=CASCADE_CHILD,
        lazy='selectin',
        order_by=[column('number')],
    )

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
    def cache_key(self) -> CacheKey:
        return (self.__tablename__, self._id)

    @override
    async def get_parents(self) -> tuple[BaseSQLModel, ...]:
        return ()
