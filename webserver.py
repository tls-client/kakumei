import os
import threading
import uvicorn
from fastapi import FastAPI, Response

app = FastAPI()

@app.api_route("/", methods=["GET", "HEAD"])
def root():
    return Response(content="running", media_type="text/plain")

@app.api_route("/health", methods=["GET", "HEAD"])
def health():
    return Response(content="ok", media_type="text/plain")


def run():
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)


def start_webserver():
    thread = threading.Thread(target=run)
    thread.daemon = True
    thread.start()
