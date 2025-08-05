import asyncio
import json
import logging
from typing import Any, Final

from sqlalchemy import Result, Select, select

import core
import models
from models.bout import GenericBoutModel
from models.models import CacheableModel
from models.rulesets.wftda_2025 import BoutModel
from models.team import RosterModel

HTTP_PORT: Final[int] = 80

logging.basicConfig(
    format='{levelname}: {message}',
    datefmt='%m/%d/%Y %H:%M:%S',
    style='{',
    level=logging.INFO,
)


@models.on_update
def broadcast_model_updates(cacheables: set[CacheableModel]) -> None:
    keys: list[tuple[Any, ...]] = [cacheable.key for cacheable in cacheables]
    payload: str = json.dumps(keys, separators=(',', ':'))
    core.broadcast(payload)


IP: str = core.get_ip_address()
PORT: int = 8000


async def main() -> None:
    await models.setup()

    # Create a Bout model if one does not already exist
    async with models.get_db() as session, session.begin():
        statement: Select[tuple[GenericBoutModel]] = select(GenericBoutModel)
        results: Result[tuple[GenericBoutModel]] = await session.execute(statement)
        if results.scalar() is None:
            print('Creating initial Bout model')
            bout: BoutModel = BoutModel(RosterModel(), RosterModel())
            session.add(bout)
        await session.commit()

    print(f'Starting server at http://{IP}{f":{PORT}" if PORT != HTTP_PORT else ""}')
    await core.serve(port=PORT)


if __name__ == '__main__':
    asyncio.run(main())
