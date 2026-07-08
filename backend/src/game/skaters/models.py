"""The Roster and Skater model and associated business logic."""

from __future__ import annotations

from typing import TYPE_CHECKING, override
from uuid import UUID  # noqa: TC003

from core.db import CASCADE_OTHER, BaseSQLModel, CacheableSQLModel
from sqlalchemy import Constraint, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from core.app import CacheKey
    from game.bouts.models import Team


class Skater(CacheableSQLModel):
    """Represent a singular Skater in roller derby."""

    _team_uuid: Mapped[UUID] = mapped_column(ForeignKey('teams.uuid'))

    num: Mapped[str] = mapped_column()
    name: Mapped[str] = mapped_column()
    pronouns: Mapped[str] = mapped_column()  # TODO: Implement pronouns

    team: Mapped[Team] = relationship(
        cascade=CASCADE_OTHER,
        lazy='selectin',
        foreign_keys=[_team_uuid],
    )

    __tablename__: str = 'skaters'
    __table_args__: tuple[Constraint, ...] = (UniqueConstraint('_team_uuid', 'num'),)

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
    def cache_key(self) -> CacheKey:
        return (self.__tablename__, self.team._bout_uuid, self.team.num, self.num)

    @override
    def get_parents(self) -> tuple[BaseSQLModel, ...]:
        return (self.team,)
