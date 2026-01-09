"""A module used for automatically checking for updates to the application.

Updating checking is a convenience feature for users. It is likely that checking for
updates will fail most of the time since most users are not likely to be connected to
the internet while using this app. This is to be expected.

During the few times that this app is run with an internet connection it should be made
easy for users to update to the latest version of the app.
"""

from .schemas import GithubReleaseSchema
from .service import UPDATE_URL, fetch_release_data, parse_latest_release

__all__ = (
    'fetch_release_data',
    'parse_latest_release',
    'GithubReleaseSchema',
    'UPDATE_URL',
)
