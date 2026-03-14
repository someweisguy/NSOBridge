# NSO Bridge

This is a scoreboard application designed for the Women's Flat Track Derby Association roller derby ruleset. This project is in its early infancy and still has a ways to go before it will be ready for scrimmages or sanctioned bouts. This is a free, open-source project which means users will never need to pay to use it, and anyone from the wonderful roller derby community (or anyone from _any_ community) may contribute to its success!

## How to Install

Click your operating system below to download NSO Bridge:

- **[Windows](https://github.com/someweisguy/NSOBridge/releases/latest/download/nsobridge-windows-latest.zip)**
- **[macOS (Apple)](https://github.com/someweisguy/NSOBridge/releases/latest/download/nsobridge-macos-26.zip)**
- **[macOS (Intel)](https://github.com/someweisguy/NSOBridge/releases/latest/download/nsobridge-macos-26-intel.zip)**

If you would prefer to run the server from the command-line, see the [command-line interface section](#command-line-interface) below.

## Differences from CRG Derby Scoreboard

The primary goal of this app is to make it easier for new NSOs to learn how to operate the scoreboard. This app achieves this goal by exposing users to a simple interface and a streamlined workflow.

This app also allows for roller derby statistics as a use-case. In addition to [WFTDA IGRF stats][WFTDA statsbook], skaters and coaches will be able to use this app to gain insights about individual and team performances in bouts.

## Information for the Nerds

This project uses the Python framework, [FastAPI][FastAPI], to host an ASGI server backend. Saved data is stored using [SQLAlchemy][SQLAlchemy] as an ORM framework and data is serialized using [Pydantic][Pydantic] models. The Typescript frontend uses [React][React] and [Vite][Vite], the popular Javascript web-development frameworks. [Tanstack Query][Tanstack Query] is used for data caching. The [Mantine][Mantine] library is used for UI design with assistance from [Tailwind CSS][Tailwind CSS]. WebSockets are used for bidirectional, client-server communication.

The backend server is provided a GUI written in [PySide6][PySide6]. This app is distributed using the Python bundler [PyInstaller][PyInstaller] so that users may easily run this app. Additional frontend documentation and frontend testing is provided by [Storybook][Storybook].

### Contributing

Everything in this app was created and reviewed by a human being. The code is heavily documented to ensure that it is maintainable and easy to make contributions. If you'd like to contribute to this app, more information and guides can be found in the [NSO Bridge wiki](https://github.com/someweisguy/NSOBridge/wiki).

### Command-Line Interface

This application offers a command-line interface for advanced users.

To install this application [npm][Node.js and npm Installation] and [Python 3.12][Python Installation] are needed. Clone this repository to a directory on your device. It is recommended to install [Astral uv][uv Installation] as a Python package manager. Create a Python virtual environment with `uv venv`. Source the newly created Python environment with `.venv/Scripts/activate` on Windows or `source .venv/bin/activate` on Linux or MacOS and then call `uv sync` to download the required Python dependencies. The Node.js dependencies can be installed by running `npm install`. Finally, the frontend can be compiled by running`npm run build`.

After all the required packages have been installed and the frontend has been built, the application can be served on all interfaces. Run the application with `python backend/src/main.py 0.0.0.0`. For more information on how to use the command-line interface, run `python backend/src/main.py --help`.

[WFTDA statsbook]: https://static.wftda.com/stats/wftda-statsbook-manual.pdf
[FastAPI]: https://fastapi.tiangolo.com/
[SQLAlchemy]: https://www.sqlalchemy.org/
[Pydantic]: https://docs.pydantic.dev/latest/
[React]: https://react.dev/
[Vite]: https://vite.dev/
[Tanstack Query]: https://tanstack.com/query/latest
[Mantine]: https://mantine.dev/
[Tailwind CSS]: https://tailwindcss.com/
[Node.js and npm Installation]: https://docs.npmjs.com/downloading-and-installing-node-js-and-npm
[Python Installation]: https://www.python.org/downloads/
[uv Installation]: https://docs.astral.sh/uv/getting-started/installation/
[PySide6]: https://pypi.org/project/PySide6/
[PyInstaller]: https://pyinstaller.org/en/stable/
[Storybook]: https://storybook.js.org/
