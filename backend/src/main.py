import logging
from derby import Series, Bout
import asyncio
import server

server.controller.log.setLevel(logging.DEBUG)

if __name__ == '__main__':
    series: Series = Series()
    bout: Bout = series.add_bout()
    server.controller.set_model(series)
    
    server.controller.load_api()
    asyncio.run(server.serve())
