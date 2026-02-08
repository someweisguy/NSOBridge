"""The injection point of the program."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Final

import core
import gui
from main import CONFIG_FILE_NAME, LOG_DIR_NAME, app

DEFAULT_RELATIVE_DATA_FILE_NAME: Final[str] = './data.db'

if __name__ == '__main__':
    from configparser import ConfigParser

    # Parse the backend arguments from the config file
    section: Final[str] = 'backend'
    config = ConfigParser()
    if not Path(CONFIG_FILE_NAME).exists():
        config.read_dict(
            {
                section: {
                    'debug': False,
                    'db_pathname': DEFAULT_RELATIVE_DATA_FILE_NAME,
                    'host': '0.0.0.0',
                    'port': 8000,
                    'auto_hide': False,
                }
            }
        )
        with open(CONFIG_FILE_NAME, 'w') as file:
            config.write(file)
    else:
        with open(CONFIG_FILE_NAME, 'r') as file:
            config.read_file(file)

    # Get the database pathname as a relative path unless it is absolute
    db_pathname: str | Path = config.get(section, 'db_pathname', fallback='')
    if db_pathname != '':
        if not Path(db_pathname).is_absolute():
            db_pathname = core.get_resource_path(db_pathname)
        else:
            db_pathname = Path(db_pathname)

    truth_values: set[str] = {'true', 'yes'}
    app.extra['db_pathname'] = db_pathname
    app.extra['host'] = config.get(section, 'host', fallback='0.0.0.0')
    app.extra['port'] = int(config.get(section, 'port', fallback=8000))
    app.debug: bool = config.get(section, 'debug', fallback='').lower() in truth_values
    auto_hide: bool = (
        config.get(section, 'auto_hide', fallback='').lower() in truth_values
    )

    # Configure logging
    log_level: int = logging.DEBUG if app.debug else logging.INFO
    core.configure_logging(LOG_DIR_NAME, level=log_level, silent=True)

    # Run the application
    gui.run(app, auto_hide=auto_hide)  # Blocks program execution
    logging.info('Program terminated')
    logging.shutdown()
    core.shutdown()
