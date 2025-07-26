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
from schemas import BoutSchema

home_roster: RosterModel = RosterModel()
away_roster: RosterModel = RosterModel()

BOUT_OPTIONS: dict[str, int] = {
    'timeouts_remaining': 3,
    'reviews_remaining': 1,
}


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

        await referee.stop_jam(bout)

        print(await referee.get_score(bout))

        bout_model: BoutSchema = BoutSchema.model_validate(bout)
        print(bout_model.model_dump())

        await session.commit()
        # await session.refresh(bout)


asyncio.run(main())
