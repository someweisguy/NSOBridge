"""A module used for automatically checking for updates to the application.

Updating checking is a convenience feature for users. It is likely that checking for
updates will fail most of the time since most users are not likely to be connected to
the internet while using this app. This is to be expected.

During the few times that this app is run with an internet connection it should be made
easy for users to update to the latest version of the app.


This app checks for updates by querying the GitHub API for the latest releases of this
code repository. Releases are expected to be tagged in a version format consistent with
Semantic Versioning. The latest version number tag can be compared to the current app
version to determine if a new release is available.
"""

from .schemas import GithubReleaseSchema
from .service import DOWNLOAD_URL, UPDATE_URL, fetch_release_data, parse_latest_release

__all__ = (
    'DOWNLOAD_URL',
    'UPDATE_URL',
    'GithubReleaseSchema',
    'fetch_release_data',
    'parse_latest_release',
)
