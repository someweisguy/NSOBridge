import asyncio
from datetime import datetime, timedelta

from sqlalchemy import Result, desc, select

from models import (
    ClockModel,
    GenericBoutModel,
    RosterModel,
    TeamModel,
    get_db,
    setup_db,
)
from models.rulesets.wftda_2025 import BoutModel
from schemas import BoutSchema, JamSchema

home_roster: RosterModel = RosterModel()
away_roster: RosterModel = RosterModel()

BOUT_OPTIONS: dict[str, int] = {
    'timeouts_remaining': 3,
    'reviews_remaining': 1,
}


async def inspect() -> None:
    async with get_db() as session, session.begin():
        results: Result[tuple[GenericBoutModel]] = await session.execute(
            select(GenericBoutModel)
        )
        bout: GenericBoutModel | None = results.scalar()
        assert bout is not None

        jam_schema: JamSchema = JamSchema.model_validate(bout.jams[-1])
        print(jam_schema.model_dump_json(indent=2))

        print()

        bout_schema: BoutSchema = BoutSchema.model_validate(bout)
        print(bout_schema.model_dump_json(indent=2))

        await session.commit()


async def main() -> None:
    await setup_db()

    async with get_db() as session, session.begin():
        bout: GenericBoutModel = BoutModel(
            clock=ClockModel(alarm=timedelta(minutes=30)), ruleset='WFTDA 2025'
        )
        bout.teams = [
            TeamModel(roster=home_roster, **BOUT_OPTIONS),
            TeamModel(roster=away_roster, **BOUT_OPTIONS),
        ]
        session.add(bout)

        bout.ready()

        bout.start_jam(datetime.now())
        # bout.add_trip('home', 4, datetime.now())
        # bout.add_trip('home', 4, datetime.now())
        # bout.set_star_pass('away', datetime.now())
        # # bout.add_trip('away', 4, datetime.now())
        # bout.stop_jam(datetime.now())

        # bout.start_timeout(datetime.now())
        # bout.stop_timeout(datetime.now())

        await session.commit()

    await inspect()


asyncio.run(main())
