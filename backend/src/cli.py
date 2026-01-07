"""Command-line arguments for the application."""

from argparse import ArgumentParser, Namespace
from typing import Final

_parser: ArgumentParser = ArgumentParser(
    prog='NSO Bridge',
    description='A scoreboard app designed for the WFTDA roller derby ruleset.',
)
_parser.add_argument(
    'host',
    type=str,
    help='The interface on which to serve the app',
)
_parser.add_argument(
    '-p',
    type=int,
    help='The port on which to serve the app (Defaults to 8000)',
    default=8000,
    dest='port',
)
_parser.add_argument(
    '-f',
    type=str,
    help='The database file to use for storing game data. If no file is provided, '
    'an in-memory database will be used',
    default='',
    dest='db_pathname',
)
_parser.add_argument(
    '-d',
    '--debug',
    help='Enable debug logging',
    action='store_true',
    dest='debug',
)
_parser.add_argument(
    '-s',
    '--silent',
    help='Disables log messages to the console',
    action='store_true',
    dest='silent',
)
_parser.add_argument(
    '-U',
    help='Disables checking for new releases on app startup',
    action='store_false',
    dest='check_for_releases',
)


args: Final[Namespace] = _parser.parse_args()
