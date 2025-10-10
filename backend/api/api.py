from collections.abc import AsyncGenerator
from typing import Annotated

import models
from fastapi import Depends
from models import AsyncSession


async def inject_db() -> AsyncGenerator[AsyncSession]:
    async with models.get_db() as session:
        yield session
        await session.commit()


DatabaseDepends = Annotated[AsyncSession, Depends(inject_db)]
