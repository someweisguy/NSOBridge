#!/usr/bin/env python3
"""The injection point of the program."""

from __future__ import annotations

import logging
import os
from pathlib import Path
from typing import Final

import core
import gui
from main import CONFIG_FILE_NAME, LOG_DIR_NAME, app

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
                    'db_pathname': 'data.db',
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
    truth_values: set[str] = {'true', 'yes'}
    app.extra['db_pathname'] = config.get(section, 'db_pathname', fallback='')
    app.extra['host'] = config.get(section, 'host', fallback='0.0.0.0')
    app.extra['port'] = int(config.get(section, 'port', fallback=8000))
    app.debug: bool = config.get(section, 'debug', fallback='').lower() in truth_values
    auto_hide: bool = (
        config.get(section, 'auto_hide', fallback='').lower() in truth_values
    )

    # Configure logging
    silent: bool = os.environ.get('SILENT_LOGGING', str(True)).lower() in truth_values
    log_level: int = logging.DEBUG if app.debug else logging.INFO
    core.configure_logging(LOG_DIR_NAME, level=log_level, silent=silent)

    # Run the application
    gui.run(app, auto_hide=auto_hide)  # Blocks program execution
    logging.info('Program terminated')
    logging.shutdown()
    core.shutdown()
