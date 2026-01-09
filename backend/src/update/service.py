"""Service methods for the updater module."""

from collections.abc import Iterable
from typing import Final

import requests
import requests.exceptions
from pydantic import ValidationError
from requests import Response
from requests.exceptions import HTTPError
from semver import VersionInfo

from .schemas import GithubReleaseSchema

OWNER: Final[str] = 'someweisguy'
REPO: Final[str] = 'NSOBridge'

UPDATE_URL: Final[str] = f'https://api.github.com/repos/{OWNER}/{REPO}/releases'
GITHUB_API_HEADERS: Final[dict[str, str]] = {'Accept': 'application/vnd.github+json'}


def fetch_release_data() -> list:
    """Fetch raw data containing all the releases of this program on Github.

    Raises:
        ConnectionError: if there was an error connecting to the Github API.

    Returns:
        list: a list of the releases for this application in raw JSON.

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

    return response.json()


def parse_latest_release(github_json: Iterable) -> GithubReleaseSchema:
    """Parse Github data and return the latest release.

    Args:
        github_json (Iterable): data received from Github describing all of this app's
        releases.

    Raises:
        ValueError: if no releases were found.

    Returns:
        GithubReleaseSchema: the latest release of this app from Github.

    """
    releases: list[GithubReleaseSchema] = []
    for obj in github_json:
        try:
            release = GithubReleaseSchema.model_validate(obj)
            if not release.draft and VersionInfo.is_valid(release.tag_name):
                releases.append(release)
        except ValidationError:
            continue
    if len(releases) == 0:
        raise ValueError('No releases found')

    releases.sort(key=lambda schema: VersionInfo.parse(schema.tag_name))

    return releases[-1]
