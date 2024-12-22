from abc import ABC
from server.view_model import Queryable


class AbstractHelper[T: Queryable](ABC):
    __slots__ = '_obj'

    def __init__(self, object: T):
        self._obj = object

    @property
    def object(self) -> T:
        return self._obj
