from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import (
    ForeignKey,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.models import SQLModel

if TYPE_CHECKING:
    from models.bout import GenericBoutModel, TimeoutModel
    from models.jam import TeamJamModel


class RosterModel(SQLModel):
    __tablename__ = 'rosters'

    # TODO: mnemonic: str
    # TODO: league
    # TODO: color
    # TODO: skaters: list[Skater]

    @property
    def parents(self) -> tuple[SQLModel, ...]:  # TODO: does this need to be None?
        return ()  # TODO


class TeamModel(SQLModel):
    __tablename__ = 'teams'

    _bout_id: Mapped[int] = mapped_column(ForeignKey('bouts._id'))
    _roster_id: Mapped[int] = mapped_column(ForeignKey('rosters._id'))

    timeouts_remaining: Mapped[int] = mapped_column()
    reviews_remaining: Mapped[int] = mapped_column()
    score_offset: Mapped[int] = mapped_column(default=0)

    bout: Mapped[GenericBoutModel | None] = relationship()
    roster: Mapped[RosterModel | None] = relationship(
        foreign_keys=[_roster_id], lazy='joined'
    )
    timeouts: Mapped[list[TimeoutModel]] = relationship(
        back_populates='team', lazy='selectin'
    )
    team_jams: Mapped[list[TeamJamModel]] = relationship(
        back_populates='team', lazy='selectin'
    )

    def __init__(self, roster: RosterModel) -> None:
        super().__init__(roster=roster)
        self.timeouts_remaining = 0
        self.reviews_remaining = 0
        self.score_offset = 0

    @property
    def parents(self) -> tuple[SQLModel | None, ...]:
        return (self.bout,)

    @property
    def bout_score(self) -> int:
        if self.bout is None:
            return 0
        return self.bout.fetch_team_bout_score(self)

    @property
    def jam_score(self) -> int:
        if self.bout is None:
            return 0
        return self.bout.fetch_team_jam_score(self)
