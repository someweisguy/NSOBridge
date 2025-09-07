from typing import Annotated, AsyncGenerator

import models
from fastapi import Depends
from models import AsyncSession


async def inject_db() -> AsyncGenerator[AsyncSession]:
    async with models.get_db() as session:
        yield session
        await session.commit()


DatabaseDepends = Annotated[AsyncSession, Depends(inject_db)]
