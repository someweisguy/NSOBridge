"""Service methods for the updater module."""

import logging
from typing import Final

import core
import requests
from requests import Response
from requests.exceptions import HTTPError

from .schemas import GithubReleaseSchema

OWNER: Final[str] = 'someweisguy'
REPO: Final[str] = 'NSOBridge'


def check_for_updates() -> list[GithubReleaseSchema]:
    """Check for the latest update of the application.

    Raises:
        HTTPError: if there was an error connecting to the Github API.

    Returns:
        list[GithubReleaseSchema]: a list of the releases for this application.

    """
    url: str = f'https://api.github.com/repos/{OWNER}/{REPO}/releases'
    response: Response = requests.get(
        url, headers={'Accept': 'application/vnd.github+json'}, timeout=5
    )
    response.raise_for_status()

    releases: list[GithubReleaseSchema] = [
        GithubReleaseSchema.model_validate(release) for release in response.json()
    ]
    if len(releases) == 0:
        raise HTTPError('No releases found')

    latest: GithubReleaseSchema = releases[-1]
    logging.debug(f'Found latest release tagged "{latest.tag_name}"')
    logging.debug(f'Current version is "{core.app.version}"')

    return releases
