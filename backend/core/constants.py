import os
from pathlib import Path
from typing import Final

CHILD_RELATIONSHIP: Final[str] = 'save-update, merge, expunge, delete, delete-orphan'
PARENT_RELATIONSHIP: Final[str] = 'expunge, save-update'


DATABASE: str = os.environ.get('DB_PATH', ':memory:')
DEBUG: bool = os.environ.get('SQLALCHEMY_DEBUG', 'false').lower() in {'true', 'yes'}
FRONTEND: Final[Path] = Path(os.environ['FRONTEND'])
