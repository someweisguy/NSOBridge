import asyncio
import logging
from typing import Final

from sqlalchemy import Result, Select, select

import core
import models
from models import CacheableModel, GenericBoutModel, RosterModel
from models.rulesets.wftda_2025 import BoutModel
from models.series import SeriesModel
from models.team import TeamModel
from schemas.ws import WebSocketSchema

HTTP_PORT: Final[int] = 80

logging.basicConfig(
    format='{levelname}: {message}',
    datefmt='%m/%d/%Y %H:%M:%S',
    style='{',
    level=logging.INFO,
)


@models.on_update
def broadcast_model_updates(cacheables: set[CacheableModel]) -> None:
    payload: WebSocketSchema = WebSocketSchema(type='cache')
    payload.data = tuple(cacheable.key for cacheable in cacheables)
    core.broadcast(payload)


PORT: int = 8000


async def main() -> None:
    await models.setup()

    # Create a Bout model if one does not already exist
    async with models.get_db() as session, session.begin():
        statement: Select[tuple[GenericBoutModel]] = select(GenericBoutModel)
        results: Result[tuple[GenericBoutModel]] = await session.execute(statement)
        if results.scalar() is None:
            print('Creating initial Bout model')
            bout: BoutModel = BoutModel(
                SeriesModel(),
                TeamModel('Home', RosterModel()),
                TeamModel('Away', RosterModel()),
            )
            session.add(bout)
        await session.commit()

    ip: str = core.get_ip_address()
    print(f'Starting server at http://{ip}{f":{PORT}" if PORT != HTTP_PORT else ""}')
    await core.serve(port=PORT)


if __name__ == '__main__':
    asyncio.run(main())
