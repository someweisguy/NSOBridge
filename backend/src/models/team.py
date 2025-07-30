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


class TeamModel(SQLModel):
    __tablename__ = 'teams'
    _bout_id: Mapped[int] = mapped_column(ForeignKey('bouts._id'))
    _roster_id: Mapped[int] = mapped_column(ForeignKey('rosters._id'))

    bout: Mapped[GenericBoutModel] = relationship()
    roster: Mapped[RosterModel] = relationship(foreign_keys=[_roster_id], lazy='joined')

    timeouts_remaining: Mapped[int] = mapped_column()
    reviews_remaining: Mapped[int] = mapped_column()
    score_offset: Mapped[int] = mapped_column(default=0)

    timeouts: Mapped[list[TimeoutModel]] = relationship(
        back_populates='team', lazy='selectin'
    )
    team_jams: Mapped[list[TeamJamModel]] = relationship(
        back_populates='team', lazy='selectin'
    )

    @property
    def bout_score(self) -> int:
        return self.bout.fetch_team_bout_score(self)

    @property
    def jam_score(self) -> int:
        return self.bout.fetch_team_jam_score(self)
