import asyncio
import logging
from typing import Final, LiteralString

import core
from api import ROUTERS
from core.database import SessionLocal
from models import RosterModel, SeriesModel
from models.rulesets.wftda_2025 import BoutModel
from sqlalchemy import Result, Select, select

PORT: int = 8000

logging.basicConfig(
    format='{levelname}: {message}',
    datefmt='%m/%d/%Y %H:%M:%S',
    style='{',
    level=logging.INFO,
)


# Attach the API to the server
API_PREFIX: LiteralString = '/api'
for router in ROUTERS:
    core.app.include_router(router, prefix=API_PREFIX)


@core.startup
async def create_initial_model() -> None:
    # Create a Bout model if one does not already exist
    bout: BoutModel | None = None
    async with SessionLocal() as session, session.begin():
        statement: Select[tuple[BoutModel]] = select(BoutModel)
        results: Result[tuple[BoutModel]] = await session.execute(statement)
        if results.scalar() is None:
            print('Creating initial Bout model')
            bout = BoutModel(
                SeriesModel(),
                RosterModel('Home'),
                RosterModel('Away'),
            )
            session.add(bout)
        await session.commit()


async def main() -> None:
    HTTP_PORT: Final[int] = 80
    ip: str = core.get_ip_address()
    print(f'Starting server at http://{ip}{f":{PORT}" if PORT != HTTP_PORT else ""}')
    await core.serve(port=PORT)


if __name__ == '__main__':
    asyncio.run(main())
