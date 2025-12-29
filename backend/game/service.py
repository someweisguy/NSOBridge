import ws
from core import BaseSQLModel
from sqlalchemy import event
from sqlalchemy.orm import Session


# TODO: uncomment this method
"""
@event.listens_for(Session, 'before_commit')
def _get_updates(session: Session) -> None:
    # Add each dirty or deleted model to a set for updates
    models: set[BaseSQLModel] = {
        model
        for identity_map in [session.dirty, session.deleted]
        for model in identity_map
        if isinstance(model, BaseSQLModel)
    }

    if len(models) > 0:
        ws.handle_updates(models)
"""