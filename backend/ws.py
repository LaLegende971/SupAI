import asyncio
import json
from typing import Any
from fastapi import WebSocket

_connections: set[WebSocket] = set()


async def ws_endpoint(websocket: WebSocket):
    await websocket.accept()
    _connections.add(websocket)
    try:
        while True:
            await asyncio.sleep(30)  # keep-alive ping
            await websocket.send_text('{"type":"ping"}')
    except Exception:
        pass
    finally:
        _connections.discard(websocket)


async def broadcast_metrics(data: dict[str, Any]):
    if not _connections:
        return
    payload = json.dumps({"type": "metrics", **data})
    dead = set()
    for ws in _connections:
        try:
            await ws.send_text(payload)
        except Exception:
            dead.add(ws)
    _connections.difference_update(dead)
