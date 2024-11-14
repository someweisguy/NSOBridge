from fastapi import FastAPI, WebSocket
from .controller import controller

view: FastAPI = FastAPI()


@view.get("/")
async def index():
    return {"Hello": "World"}


@view.websocket('/ws')
async def ws(websocket: WebSocket):
    await controller.handle_websocket(websocket)
