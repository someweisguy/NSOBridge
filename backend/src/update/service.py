"""Service methods for the updater module."""

from typing import Final

import requests
import requests.exceptions
from requests import Response
from requests.exceptions import HTTPError

from .schemas import GithubReleaseSchema

OWNER: Final[str] = 'someweisguy'
REPO: Final[str] = 'NSOBridge'

UPDATE_URL: Final[str] = f'https://api.github.com/repos/{OWNER}/{REPO}/releases'


def check_for_releases() -> list[GithubReleaseSchema]:
    """Check for the latest release of the application.

    Raises:
        ConnectionError: if there was an error connecting to the Github API.

    Returns:
        list[GithubReleaseSchema]: a list of the releases for this application.

    """
    try:
        response: Response = requests.get(
            UPDATE_URL, headers={'Accept': 'application/vnd.github+json'}, timeout=5
        )
        response.raise_for_status()
    except (
        HTTPError,
        requests.exceptions.ConnectionError,
        requests.exceptions.Timeout,
    ) as e:
        raise ConnectionError('Could not fetch updates at this time') from e

    releases: list[GithubReleaseSchema] = [
        GithubReleaseSchema.model_validate(release) for release in response.json()
    ]
    if len(releases) == 0:
        raise ConnectionError('No releases found')

    return releases
