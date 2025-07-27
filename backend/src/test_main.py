import asyncio
from datetime import timedelta

from models import (
    BoutModel,
    ClockModel,
    JamModel,
    RosterModel,
    TeamModel,
    get_db,
    setup_db,
)
from rules import REFEREES, AbstractReferee
from schemas.bout import BoutSchema
from schemas.jam import JamSchema

home_roster: RosterModel = RosterModel()
away_roster: RosterModel = RosterModel()

BOUT_OPTIONS: dict[str, int] = {
    'timeouts_remaining': 3,
    'reviews_remaining': 1,
}


async def inspect() -> None:
    async with get_db() as session:
        bout: BoutModel | None = await session.get(BoutModel, 1)
        assert bout is not None

        print(bout.jams[-1])

        jam_schema: JamSchema = JamSchema.model_validate(bout.jams[-1])
        print(jam_schema.model_dump())

        # bout_schema: BoutSchema = BoutSchema.model_validate(bout)
        # print(bout_schema.model_dump())


async def main() -> None:
    await setup_db()

    async with get_db() as session, session.begin():
        bout: BoutModel = BoutModel(
            clock=ClockModel(alarm=timedelta(minutes=30)), ruleset='WFTDA 2025'
        )
        bout.teams = [
            TeamModel(roster=home_roster, **BOUT_OPTIONS),
            TeamModel(roster=away_roster, **BOUT_OPTIONS),
        ]

        Ruleset: type[AbstractReferee] | None = REFEREES.get(bout.ruleset)
        assert Ruleset is not None

        jam: JamModel = bout.add_jam()
        jam.assign_teams(*bout.teams[:2])
        session.add(bout)

        referee: AbstractReferee = Ruleset(db=session)
        await referee.start_jam(bout)
        await referee.add_trip(bout.jams[-1], 'home', 4)
        # await referee.add_trip(bout.jams[-1], 'away', 4)

        await referee.stop_jam(bout)
        await session.flush()
        
    await inspect()



asyncio.run(main())
