from typing import Any
import asyncio
import server.api.series
import server
import json


if __name__ == '__main__':
    import roller_derby
    roller_derby.bouts.add()

    series: dict[str, Any] = server.api.series.get()
    asyncio.run(
        server.serve(context={
            'series': json.dumps(series)
        })
    )
