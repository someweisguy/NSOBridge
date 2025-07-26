import asyncio
from datetime import datetime, timedelta

from pydantic import BaseModel, ConfigDict, Field, computed_field

from models import SessionLocal, SQLBout, SQLClock, SQLRoster, SQLTeam, setup_db
from models.jam import SQLJam
from rules import REFEREES, Referee

home_roster: SQLRoster = SQLRoster()
away_roster: SQLRoster = SQLRoster()

BOUT_OPTIONS: dict[str, int] = {
    'timeouts_remaining': 3,
    'reviews_remaining': 1,
}


class Timeout(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    start_timestamp: datetime
    stop_timestamp: datetime | None


class Jam(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    start_timestamp: datetime | None
    stop_timestamp: datetime | None
    period: int
    jam: int


class Bout(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    ruleset: str
    jams: list[Jam] = Field(exclude=True)
    timeouts: list[Timeout] = Field(exclude=True)

    @computed_field
    @property
    def active_jam(self) -> Jam | None:
        if len(self.jams) == 0:
            return None
        return self.jams[-1]

    @computed_field
    @property
    def latest_timeout(self) -> Timeout | None:
        if len(self.timeouts) == 0:
            return None
        return self.timeouts[-1]

    @computed_field
    @property
    def num_jams(self) -> int:
        return len(self.jams)


async def main() -> None:
    await setup_db()

    async with SessionLocal() as session, session.begin():
        bout: SQLBout = SQLBout(
            clock=SQLClock(alarm=timedelta(minutes=30)), ruleset='WFTDA 2025'
        )
        bout.teams = [
            SQLTeam(roster=home_roster, **BOUT_OPTIONS),
            SQLTeam(roster=away_roster, **BOUT_OPTIONS),
        ]

        Ruleset: type[Referee] | None = REFEREES.get(bout.ruleset)
        assert Ruleset is not None

        jam: SQLJam = bout.add_jam()
        jam.assign_teams(*bout.teams)
        session.add(bout)

        referee: Referee = Ruleset(db=session)
        await referee.start_jam(bout)

        await referee.stop_jam(bout)

        bout_model: Bout = Bout.model_validate(bout)
        print(bout_model.model_dump())

        await session.commit()
        # await session.refresh(bout)


asyncio.run(main())
