# NSO Bridge

An alpha version is coming soon!

This is a scoreboard application designed for the Women's Flat Track Derby Association roller derby ruleset. This project is in its very early infancy and still has quite a ways to go before it will be ready for scrimmages or sanctioned bouts. This is a free, open-source project which means users will never need to pay to use it, and anyone from the wonderful roller derby community (or anyone from _any_ community) may contribute to its success!

## Differences from CRG Derby Scoreboard

The primary goal of this app is to make it easier for new NSOs to learn how to operate the scoreboard. This app achieves this goal by exposing users to a simpler interface and a streamlined workflow.

This app also prioritizes roller derby statistics as a main use-case. In addition to [WFTDA IGRF stats](https://static.wftda.com/stats/wftda-statsbook-manual.pdf), skaters and coaches will be able to use this app to gain insights about individual performances in bouts. For example, coaches will be able glean which skaters are most successful against a particular wall. This will ensure that coaches have the information that they need to field the best skaters for the jam. Skaters will be able to track their stats over time. This will ensure that skaters can set [smart goals](https://en.wikipedia.org/wiki/SMART_criteria) to improve their skills over time.

## Information for the Nerds

This project uses the Python framework, FastAPI, to host an ASGI server backend. Saved data is stored using SQLAlchemy as an ORM framework and data is serialized using Pydantic models. The frontend uses React, the popular Javascript web-development framework. Websockets is used for bidirectional, client-server communication.

To use this app in its current state, Python 3.14 and Node.js is required. Clone this repository into a directory on your device and install the Python requirements found in `pyproject.toml`. The React frontend dependencies can be installed by running `npm install` and then the frontend can be built by running `npm run build`.

Executables files will be created using the Python module, _pyinstaller_, though the creation of executables is not supported at this time. This program is currently command-line only, by running `backend/main.py` in your Python interpreter.
