# NSO Bridge

This is a scoreboard application designed for the Women's Flat Track Derby Association roller derby ruleset. This project is in its early infancy and still has a ways to go before it will be ready for scrimmages or sanctioned bouts. This is a free, open-source project which means users will never need to pay to use it, and anyone from the wonderful roller derby community (or anyone from _any_ community) may contribute to its success!

## How to Install

This app currently supports running in a command line interface which is an advanced installation method. Users who wish to run this app as a command line program should read below. An easy installation method is coming soon!

### Command-Line Interface

This application offers a command-line interface for advanced users.

To install this application [NPM][Node.js and NPM Installation] and [Python 3.14][Python Installation] (or greater) are needed. Clone this repository to a directory on your device. It is recommended to install [Astral uv][uv Installation] as a package manager but it is not required. Download the required Python packages listed in `pyproject.toml` by running `python pip install .` or `uv pip install .` if Astral uv is installed. The Node.js dependencies can be installed by running `npm install .`. Finally, the frontend can be compiled by running `npm run build`.

After all the required packages have been installed and the frontend has been built, the application can be started on all interfaces by running `python backend/main.py 0.0.0.0`. For more information on how to use the command-line interface, run `python backend/main.py --help`.

## Differences from CRG Derby Scoreboard

The primary goal of this app is to make it easier for new NSOs to learn how to operate the scoreboard. This app achieves this goal by exposing users to a simpler interface and a streamlined workflow.

This app also allows for roller derby statistics as a use-case. In addition to [WFTDA IGRF stats][WFTDA statsbook], skaters and coaches will be able to use this app to gain insights about individual performances in bouts. For example, coaches will be able glean which skaters are most successful against a particular wall. This will ensure that coaches have the information that they need to field the best skaters for the jam. Skaters will be able to track their stats over time. This will ensure that skaters can set [smart goals][SMART goals] to improve their skills over time.

## Information for the Nerds

This project uses the Python framework, [FastAPI][FastAPI], to host an ASGI server backend. Saved data is stored using [SQLAlchemy][SQLAlchemy] as an ORM framework and data is serialized using [Pydantic][Pydantic] models. The Typescript frontend uses [React][React], the popular Javascript web-development framework. [Tanstack Query][Tanstack Query] is used for data caching and [Mantine][Mantine] is used as a UI framework. Websockets is used for bidirectional, client-server communication.

A proper server-side GUI is planned for this app, but it is not yet supported. Until then, this app is command-line only.

This app will be distributed using a Python bundler, such as _pyinstaller_, so that users may easily run this app. Python bundling is not yet supported.

### Contributing

If you'd like to contribute to this app, more information can be found in the [NSO Bridge wiki](https://github.com/someweisguy/NSOBridge/wiki).

[WFTDA statsbook]: https://static.wftda.com/stats/wftda-statsbook-manual.pdf
[SMART goals]: https://en.wikipedia.org/wiki/SMART_criteria
[FastAPI]: https://fastapi.tiangolo.com/
[SQLAlchemy]: https://www.sqlalchemy.org/
[Pydantic]: https://docs.pydantic.dev/latest/
[React]: https://react.dev/
[Tanstack Query]: https://tanstack.com/query/latest
[Mantine]: https://mantine.dev/
[Node.js and NPM Installation]: https://docs.npmjs.com/downloading-and-installing-node-js-and-npm
[Python Installation]: https://www.python.org/downloads/
[uv Installation]: https://docs.astral.sh/uv/getting-started/installation/
