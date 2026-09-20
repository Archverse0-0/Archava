import os
from livekit import api
from flask import Flask, request
from dotenv import load_dotenv
from flask_cors import CORS
import uuid

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

def generate_room_name():
    # UUIDs are collision-safe without a LiveKit control-plane round trip. This
    # keeps token issuance available during transient DNS/network failures.
    return "room-" + uuid.uuid4().hex[:12]

@app.route("/getToken")
def get_token():
    name = request.args.get("name", "my name")
    room = request.args.get("room", None)

    if not room:
        room = generate_room_name()

    api_key = os.getenv("LIVEKIT_API_KEY")
    api_secret = os.getenv("LIVEKIT_API_SECRET")
    if not api_key or not api_secret:
        return {"error": "LiveKit credentials are not configured"}, 503

    token = api.AccessToken(api_key, api_secret) \
        .with_identity(name)\
        .with_name(name)\
        .with_grants(api.VideoGrants(
            room_join=True,
            room=room
        ))
    
    return token.to_jwt(), 200, {"Content-Type": "text/plain; charset=utf-8"}


@app.route("/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False)
