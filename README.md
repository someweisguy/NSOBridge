# NSO Bridge

This is a scoreboard application designed for the Women's Flat Track Derby Association roller derby ruleset. This project is in its very early infancy and still has quite a ways to go before it will be ready for scrimmages or sanctioned bouts. This is a free, open-source project which means users will never need to pay to use it, and anyone from the wonderful roller derby community (or anyone from _any_ community) may contribute to its success!

## Information for the Nerds

This project uses the Python framework, Starlette, to host an ASGI server backend. The frontend uses React, the popular Javascript web-development framework. Websocket is used for bidirectional, client-server communication.

To use this app in its current state, Python 3.12 and Node.js is required. Clone this repository into a directory on your device and install the Python requirements found in `requirements.txt`. The React frontend dependencies can be installed by running `npm install` and then the frontend can be built by running `npm run build`.

Executables files will be created using the Python module, _pyinstaller_, though the creation of executables is not supported at this time. This program is currently command-line only, by running `main.py` in your Python interpreter.
