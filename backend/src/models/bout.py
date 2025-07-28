from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.jam import JamModel
from models.models import SQLModel
from models.time import ClockModel, TimeoutModel

if TYPE_CHECKING:
    from models.team import TeamModel


class BoutModel(SQLModel):
    __tablename__ = 'bouts'
    _clock_id: Mapped[int] = mapped_column(
        ForeignKey('clocks._id', ondelete='RESTRICT'), init=False
    )

    ruleset: Mapped[str] = mapped_column()

    teams: Mapped[list[TeamModel]] = relationship(init=False, lazy='selectin')
    clock: Mapped[ClockModel] = relationship(foreign_keys=[_clock_id], lazy='joined')
    timeouts: Mapped[list[TimeoutModel]] = relationship(init=False, lazy='selectin')
    jams: Mapped[list[JamModel]] = relationship(
        init=False,
        lazy='selectin',
        load_on_pending=True,
        order_by=[JamModel.period, JamModel.jam],
    )

    __mapper_args__ = {'polymorphic_on': 'ruleset'}

    def add_jam(self) -> JamModel:
        period_num: int = 0
        jam_num: int = 0
        if len(self.jams) > 0:
            latest: JamModel = self.jams[-1]
            period_num = latest.period
            jam_num = latest.jam + 1
        jam: JamModel = JamModel(period=period_num, jam=jam_num)
        self.jams.append(jam)
        return jam

    def call_timeout(self, timestamp: datetime | None = None) -> TimeoutModel:
        if timestamp is None:
            timestamp = datetime.now()
        period_num: int = 0
        jam_num: int = 0
        if len(self.jams) > 1:
            # Timeouts are recorded on the latest running Jam
            latest: JamModel = self.jams[-2]
            period_num = latest.period
            jam_num = latest.jam
        timeout: TimeoutModel = TimeoutModel(
            period=period_num,
            jam=jam_num,
            clock_elapsed=self.clock.get_duration(timestamp),
        )
        self.timeouts.append(timeout)
        timeout.start(timestamp)
        return timeout
