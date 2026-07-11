"""Module-level Socket.IO AsyncServer singleton — shared by the adapter and handlers."""

import socketio

sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")
