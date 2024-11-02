import asyncio
from typing import Any
import server.api.series
import server
import json


if __name__ == '__main__':
    import roller_derby
    roller_derby.bouts.add()

    series: dict[str, Any] = server.api.series.get()
    asyncio.run(server.serve(context={
        'bouts': json.dumps(series)
    }))
