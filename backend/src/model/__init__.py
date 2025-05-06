from uuid import UUID, uuid4

from .bout import Bout

bouts: dict[UUID, Bout] = {uuid4(): Bout('WFTDA 2025')}
