from fastapi import FastAPI
import threading
import uvicorn

app = FastAPI()

@app.get("/")
@app.head("/")
def root():
    return {"status": "running"}

@app.get("/health")
@app.head("/health")
def health():
    return {"status": "ok"}

def run():
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="warning")

def start_webserver():
    thread = threading.Thread(target=run)
    thread.daemon = True
    thread.start()
