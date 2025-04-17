import os
from pathlib import Path
from typing import Annotated, Final

from fastapi import Depends
from fastapi.templating import Jinja2Templates

from controller import Controller

CLIENT_ID_COOKIE_NAME: Final[str] = 'client_id'
FRONTEND: Final[Path] = Path(os.getcwd()) / 'frontend' / 'dist'

TEMPLATES: Final[Jinja2Templates] = Jinja2Templates(FRONTEND)

ControllerDepend = Annotated[Controller, Depends(Controller.get_instance)]
