import server
from roller_derby.score import Jam
from roller_derby.timer import Timer
from roller_derby.encodable import ClientException
from datetime import datetime, timedelta
from typing import Any

@server.register
async def jamTimer(
    method: str, latency: int, stopReason: None | Jam.StopReason = None, **_
) -> None | dict[str, Any]:
    NOW: datetime = datetime.now()
    
    # Get the Jam Timer
    timer: Timer = server.bouts.timer.jam

    # Handle the method
    match method:
        case "get":
            return timer.encode()
        case "set":
            raise NotImplementedError()
        case "start":
            # Start the timer from the 
            timestamp: datetime = NOW - timedelta(milliseconds=latency)
            server.bouts.currentBout.currentJam.start(timestamp)
            timer.start(timestamp)
        case "stop":
            if not isinstance(stopReason, Jam.StopReason):
                raise TypeError(
                    f"stopReason must be Jam.StopReason, not {type(stopReason).__name__}"
                )
            timestamp: datetime = NOW - timedelta(milliseconds=latency)
            server.bouts.currentBout.currentJam.stop(stopReason, timestamp)
            timer.stop(timestamp)
        case _:
            raise ClientException(f"Unknown method '{method}'.")

    # Broadcast the updates
    await server.emit("jamTimer", timer.encode())

if __name__ == "__main__":
    import scoreApi  # noqa: F401
    import asyncio
    import socket

    port: int = 8000
    serverAddress: str = "0.0.0.0"
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
        sock.settimeout(0)
        sock.connect(("1.1.1.1", 1))  # Doesn't actually send network data
        serverAddress = sock.getsockname()[0]
    httpStr: str = f"http://{serverAddress}:{port}"
    server.log.info(f"Starting server at '{httpStr}'.")

    currentJam = server.bouts.currentBout.currentJam
    currentJam.start(datetime.now())

    asyncio.run(server.serve(port, debug=True))
