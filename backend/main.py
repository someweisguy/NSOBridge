import asyncio
import logging
from typing import Final, LiteralString

import core
import models
from api.api import router as history_router
from api.bout import router as bout_router
from api.jam import router as jam_router
from api.roster import router as roster_router
from api.series import router as series_router
from core.ws import WebSocketSchema
from models import CacheableModel, GenericBoutModel, RosterModel
from models.rulesets.wftda_2025 import BoutModel
from models.series import SeriesModel
from sqlalchemy import Result, Select, select

PORT: int = 8000

logging.basicConfig(
    format='{levelname}: {message}',
    datefmt='%m/%d/%Y %H:%M:%S',
    style='{',
    level=logging.INFO,
)


# Broadcast model updates over WebSocket
@models.on_update
def broadcast_model_updates(cacheables: set[CacheableModel]) -> None:
    payload: WebSocketSchema = WebSocketSchema('cache')
    payload.data = tuple(cacheable.key for cacheable in cacheables)
    core.broadcast(payload)


# Attach the API to the server
API_PREFIX: LiteralString = '/api'
# TODO: generate a list of routers in the API module and import it here
for router in [bout_router, series_router, roster_router, history_router, jam_router]:
    core.app.include_router(router, prefix=API_PREFIX)


async def main() -> None:
    # Create a Bout model if one does not already exist
    async with models.get_db() as session, session.begin():
        statement: Select[tuple[GenericBoutModel]] = select(GenericBoutModel)
        results: Result[tuple[GenericBoutModel]] = await session.execute(statement)
        if results.scalar() is None:
            print('Creating initial Bout model')
            bout: BoutModel = BoutModel(
                SeriesModel(),
                RosterModel('Home'),
                RosterModel('Away'),
            )
            session.add(bout)
        await session.commit()

    HTTP_PORT: Final[int] = 80
    ip: str = core.get_ip_address()
    print(f'Starting server at http://{ip}{f":{PORT}" if PORT != HTTP_PORT else ""}')
    await core.serve(port=PORT)


if __name__ == '__main__':
    asyncio.run(main())
