"""A module used for automatically checking for updates to the application.

Updating checking is a convenience feature for users. It is likely that checking for
updates will fail most of the time since most users are not likely to be connected to
the internet while using this app.
"""

from .schemas import GithubReleaseSchema
from .service import check_for_updates

__all__ = ('check_for_updates', 'GithubReleaseSchema')
