# flake8: noqa
from .series import Series
from .bout import Bout, Timer
from .jam import Jam
from uuid import UUID as BoutId

bouts: Series = Series()
