import asyncio
import json
from datetime import datetime
from typing import Any

from sqlalchemy import Result, select

import core
import models
from models import (
    CacheableModel,
    GenericBoutModel,
    RosterModel,
    get_db,
    setup_db,
)
from models.rulesets.wftda_2025 import BoutModel
from schemas import BoutSchema, JamSchema


@models.on_update
def broadcast_model_updates(cacheables: set[CacheableModel]) -> None:
    keys: list[tuple[Any, ...]] = [cacheable.key for cacheable in cacheables]
    payload: str = json.dumps(keys, separators=(',', ':'))
    core.broadcast(payload)


home_roster: RosterModel = RosterModel()
away_roster: RosterModel = RosterModel()


async def inspect() -> None:
    async with get_db() as session, session.begin():
        results: Result[tuple[GenericBoutModel]] = await session.execute(
            select(GenericBoutModel)
        )
        bout: GenericBoutModel | None = results.scalar()
        assert bout is not None

        bout.add_trip('home', 4, datetime.now())

        bout.stop_jam(datetime.now())
        # bout.stop(datetime.now())
        # bout.add_trip('home', 4, datetime.now())

        # bout.stop_jam(datetime.now())
        # await session.flush()
        # await session.refresh(bout)
        # bout.start_jam(datetime.now())

        # jam_schema: JamSchema = JamSchema.model_validate(bout.jams[-1])
        # print(jam_schema.model_dump_json(indent=2))

        # print()

        # bout_schema: BoutSchema = BoutSchema.model_validate(bout)
        # print(bout_schema.model_dump_json(indent=2))
        await session.commit()


async def main() -> None:
    await setup_db()

    async with get_db() as session, session.begin():
        bout: GenericBoutModel = BoutModel(home_roster, away_roster)
        session.add(bout)

        await session.flush()
        await session.refresh(bout)

        bout.start(datetime.now())
        bout.start_jam(datetime.now())

        # bout.start_jam(datetime.now())

        # bout.set_star_pass('away', datetime.now())
        # # bout.add_trip('away', 4, datetime.now())
        # bout.stop_jam(datetime.now())

        # bout.start_timeout(datetime.now())
        # bout.stop_timeout(datetime.now())

        await session.commit()

    await inspect()


asyncio.run(main())
