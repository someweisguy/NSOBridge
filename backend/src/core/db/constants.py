"""Constants."""

from typing import Final

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

CASCADE_CHILD: Final[str] = 'all, delete-orphan'
"""SQLAlchemy relationship cascade type which should be applied to all child 
relationships.
"""

CASCADE_OTHER: Final[str] = 'expunge, save-update'
"""SQLalchemy relationship cascade type which should be applied to all non-children 
relationships, i.e. parent relationships or other non-inferior relationships.
"""


session_factory: Final[async_sessionmaker[AsyncSession]] = async_sessionmaker[
    AsyncSession
](expire_on_commit=False)
