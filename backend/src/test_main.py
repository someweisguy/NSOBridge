import asyncio
from datetime import timedelta

from core.models.game import SessionLocal, setup_db
from core.models.game.bout import SQLBout
from core.models.game.jam import SQLJam
from core.models.game.team import SQLRoster, SQLTeam
from core.models.game.time import SQLClock
from core.models.rules import REFEREES
from core.models.rules.wftda_2025 import Referee

home_roster: SQLRoster = SQLRoster()
away_roster: SQLRoster = SQLRoster()

BOUT_OPTIONS: dict[str, int] = {
    'timeouts_remaining': 3,
    'reviews_remaining': 1,
}


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

        await session.commit()
        # await session.refresh(bout)


asyncio.run(main())
