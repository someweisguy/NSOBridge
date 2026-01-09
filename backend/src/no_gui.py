"""Command-line arguments for the application."""

import asyncio
import logging
from argparse import ArgumentParser, Namespace
from typing import Final, Iterable

import core
import update
from main import LOG_DIR_NAME, app
from semver import VersionInfo
from update import GithubReleaseSchema
from uvicorn import Server

parser: ArgumentParser = ArgumentParser(
    prog=app.title,
    description=app.description,
)
parser.add_argument(
    'host',
    type=str,
    help='The interface on which to serve the app',
)
parser.add_argument(
    '-p',
    type=int,
    help='The port on which to serve the app (Defaults to 8000)',
    default=8000,
    dest='port',
)
parser.add_argument(
    '-f',
    type=str,
    help='The database file to use for storing game data. If no file is provided, '
    'an in-memory database will be used',
    default='',
    dest='db_pathname',
)
parser.add_argument(
    '-d',
    '--debug',
    help='Enable debug logging',
    action='store_true',
    dest='debug',
)
parser.add_argument(
    '-s',
    '--silent',
    help='Disables log messages to the console',
    action='store_true',
    dest='silent',
)
parser.add_argument(
    '-U',
    help='Disables checking for new releases on app startup',
    action='store_false',
    dest='check_for_releases',
)


if __name__ == '__main__':
    args: Final[Namespace] = parser.parse_args()

    # Import the command line arguments
    app.debug: bool = args.debug
    app.extra['db_pathname'] = args.db_pathname
    app.extra['host'] = args.host
    app.extra['port'] = args.port

    # Configure logging
    silent_logging: bool = args.silent
    log_level: int = logging.DEBUG if app.debug else logging.INFO
    core.configure_logging(LOG_DIR_NAME, level=log_level, silent=silent_logging)

    # Check for new releases in the Github releases page
    if args.check_for_releases:
        logging.info('Checking for new releases')
        try:
            data: Iterable = update.fetch_release_data()
            release: GithubReleaseSchema = update.parse_latest_release(data)

            latest_version: VersionInfo = VersionInfo.parse(release.tag_name)
            current_version: VersionInfo = VersionInfo.parse(app.version)
            logging.debug(f'Found latest release tagged "{release.tag_name}"')
            logging.debug(f'Current version is "{app.version}"')
            if current_version < latest_version:
                logging.info(
                    f'A new version is available! Download it at {release.html_url}'
                )
        except (ConnectionError, ValueError):
            logging.warning('Unable to check for releases at this time')
    else:
        logging.info('Skipping release check')

    # Run the application
    server: Server = core.get_server(app)
    try:
        asyncio.run(server.serve())
    except KeyboardInterrupt:
        logging.info('Handling keyboard interrupt')
    finally:
        logging.info('Program terminated')
        logging.shutdown()
        core.shutdown()
