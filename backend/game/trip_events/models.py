from datetime import datetime

from models import PARENT_RELATIONSHIP, BaseSQLModel
from pip._vendor.platformdirs.version import TYPE_CHECKING
from sqlalchemy import CheckConstraint, Constraint, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from game.team_jams.models import BaseTeamJamModel  # noqa: TC004


class TripEventModel(BaseSQLModel):
    team_jam_id: Mapped[int | None] = mapped_column(ForeignKey('team_jams.id'))
    timestamp: Mapped[datetime] = mapped_column()
    lead: Mapped[bool] = mapped_column(default=False)
    lost: Mapped[bool] = mapped_column(default=False)
    passes: Mapped[int | None] = mapped_column(default=None)
    star_pass: Mapped[bool] = mapped_column(default=False)

    team_jam: Mapped[BaseTeamJamModel | None] = relationship(
        cascade=PARENT_RELATIONSHIP,
        foreign_keys=[team_jam_id],
        lazy='joined',
    )

    __tablename__: str = 'trip_events'
    __table_args__: tuple[Constraint, ...] = (
        CheckConstraint('passes IS NULL OR (lead = 0 AND lost = 0 AND star_pass = 0)'),
    )

    def __init__(
        self,
        timestamp: datetime,
        *,
        lead: bool = False,
        lost: bool = False,
        passes: int = 0,
        star_pass: bool = False,
    ) -> None:
        super().__init__(
            team_jam=None,
            timestamp=timestamp,
            lead=lead,
            lost=lost,
            passes=passes,
            star_pass=star_pass,
        )

    def is_empty(self) -> bool:
        return not any((self.lead, self.lost, self.passes, self.star_pass))
