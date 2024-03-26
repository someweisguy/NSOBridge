from PyQt6.QtWidgets import QApplication, QWidget
from flask import Flask, render_template
from flask_socketio import SocketIO
from engineio.async_drivers import gevent  # noqa: F401 - Required for pyinstaller bundle
from threading import Thread
import sys
import time
from dataclasses import dataclass

DEBUG_FLASK = True

app = Flask(__name__)
socketio = SocketIO(app)
gui = QApplication(sys.argv)


@app.route("/")
def index():
    context = {"sync_iterations": 10}
    return render_template("index.html", **context)


@socketio.event
def sync():
    now = time.time_ns()
    return round(now / 1_000_000)

class Timer:
    def __init__(self, value: int = 120_000):
        self._value = value
        self._start = None
    
    def __str__(self) -> str:
        val = self.value()
        minutes = val / 60_000
        seconds = val / 1_000
        return f"{minutes}:{seconds}"

    @staticmethod
    def server_time() -> int:
        """Gets the server time in milliseconds using a monotonic clock."""
        now = time.monotonic_ns()
        return now // 1_000_000
    
    def start(self, start_time: int | None = None) -> bool:
        if self._start is not None:
            return False
        if start_time is None:
            start_time = Timer.server_time()
        self._start = start_time
        return True

    def stop(self, stop_time: int | None = None) -> bool:
        if self._start is None:
            return False
        if stop_time is None:
            stop_time = Timer.server_time()
        self._value -= stop_time - self._start
        self._start = None
        return True
    
    def value(self, time: int | None = None) -> int:
        if self._start is None:
            return self._value
        if time is None:
            time = Timer.server_time()
        return (self._value - (time - self._start))

@dataclass(frozen=True)
class Skater:
    number: str
    name: str

    def __str__(self) -> str:
        return f"{self.number}: {self.name}"

    def __hash__(self) -> int:
        return hash(self.number)

    def __eq__(self, other) -> bool:
        if isinstance(other, Skater):
            return self.number == other.number
        elif isinstance(other, str):
            return self.number == other
        else:
            return False

class Team:
    def __init__(self, league_name: str, team_name: str) -> None:
        self.league_name: str = league_name
        self.name: str = team_name
        self._roster: list[Skater] = list()

    def __getitem__(self, key: str) -> Skater:
        if isinstance(key, str) and key in self._roster:
            return self._roster[self._roster.index(key)]
        else:
            raise ValueError(f"Team indices must be string, not {type(key).__name__}")
    
    def __iter__(self) -> Skater:
        return self._roster.__iter__()
    
    def __next__(self) -> Skater:
        return self._roster.__next__()
    
    def __str__(self) -> str:
        return f"{self.league_name}, {self.name}"

    def __len__(self) -> int:
        return len(self._roster)
    
    def add(self, skater: Skater) -> bool:
        if not isinstance(skater, Skater) or skater in self._roster:
            return False
        self._roster.append(skater)
        return True
    
    def remove(self, skater: Skater | str) -> bool:
        if skater not in self._roster:
            return False
        self._roster.remove(skater)
        return True
    
if __name__ == "__main__":  
    if DEBUG_FLASK:
        # Debug the Flask application without the Qt GUI
        socketio.run(app, "0.0.0.0", 5000, debug=True)
    else:
        # Run the Flask application and Qt GUI on separate threads
        Thread(target=socketio.run, args=(app, "0.0.0.0", 5000), daemon=True).start()
        window = QWidget()
        window.show()
        gui.exec()
