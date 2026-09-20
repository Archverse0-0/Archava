from __future__ import annotations

import os
import time
import uuid
from collections import defaultdict, deque
from threading import Lock

from dotenv import load_dotenv
from flask import Flask, request
from flask_cors import CORS
from livekit import api

load_dotenv()

app = Flask(__name__)


def _allowed_origins() -> list[str]:
    raw = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


CORS(app, resources={r"/getToken": {"origins": _allowed_origins()}})

_RATE_WINDOW_SECONDS = 60
_RATE_LIMIT = max(1, int(os.getenv("TOKEN_RATE_LIMIT_PER_MINUTE", "30")))
_rate_lock = Lock()
_rate_buckets: dict[str, deque[float]] = defaultdict(deque)


def generate_room_name() -> str:
    return "room-" + uuid.uuid4().hex[:16]


def generate_identity() -> str:
    return "guest-" + uuid.uuid4().hex[:16]


def _display_name() -> str:
    raw = request.args.get("name", "Guest").strip()
    safe = "".join(ch for ch in raw if ch.isalnum() or ch in " ._-")[:64]
    return safe or "Guest"


def _rate_limit_key() -> str:
    return request.remote_addr or "unknown"


def _allow_token_request() -> bool:
    now = time.monotonic()
    cutoff = now - _RATE_WINDOW_SECONDS
    key = _rate_limit_key()

    with _rate_lock:
        bucket = _rate_buckets[key]
        while bucket and bucket[0] < cutoff:
            bucket.popleft()
        if len(bucket) >= _RATE_LIMIT:
            return False
        bucket.append(now)
        return True


@app.get("/getToken")
def get_token():
    if not _allow_token_request():
        return {"error": "Too many token requests"}, 429, {"Retry-After": "60"}

    api_key = os.getenv("LIVEKIT_API_KEY")
    api_secret = os.getenv("LIVEKIT_API_SECRET")
    if not api_key or not api_secret:
        return {"error": "LiveKit credentials are not configured"}, 503

    # Never trust a caller-supplied LiveKit room or participant identity.
    # Every token request creates a fresh room and server-generated identity.
    room = generate_room_name()
    identity = generate_identity()
    display_name = _display_name()

    token = (
        api.AccessToken(api_key, api_secret)
        .with_identity(identity)
        .with_name(display_name)
        .with_grants(api.VideoGrants(room_join=True, room=room))
    )

    headers = {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store, private",
        "Pragma": "no-cache",
        "X-Content-Type-Options": "nosniff",
    }
    return token.to_jwt(), 200, headers


@app.get("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False)
