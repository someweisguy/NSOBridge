"""Manage database connections and data management using an ORM.

SQLAlchemy is used to manage an SQL database for data management. This submodule defines
the base class for all SQL models in this application.

Cache management is handled with a dedicated cached model class called CachedSQLModel.
This cached model is the only model which should be queryable by the user, because
cached models implement the Memento pattern to manage the undo/redo history feature
exposed in the `core.users` submodule. The Memento pattern is implemented with a
careful use of model relationships. When defining relationships for a given model,
models that are children of the given model should be giving a relationship cascade
value of `CASCADE_CHILD`. Otherwise, the cascade value should be `CASCADE_OTHER`. This
ensures that database mementos only include all of the recursive children of a given
model.

Subsequently, it is imperative that methods in a model only mutate its children and
never mutate non-children relationships.

CachedSQLModels also includes methods such as `get_cache_key()` to generate cache keys
which may be communicated to clients.

"""

from .constants import CASCADE_CHILD, CASCADE_OTHER, session_factory
from .dependencies import GetAsyncSession
from .models import BaseSQLModel, CacheableSQLModel
from .service import (
    create_tables,
    get_database_url,
)

__all__ = (
    'BaseSQLModel',
    'CacheableSQLModel',
    'CASCADE_CHILD',
    'CASCADE_OTHER',
    'create_tables',
    'get_database_url',
    'get_mutated_cache_models',
    'GetAsyncSession',
    'session_factory',
)
