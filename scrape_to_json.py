import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime

URL = "https://disboard.org/ja/servers?sort=updated"
HEADERS = {"User-Agent": "Mozilla/5.0"}

def fetch_servers():
    res = requests.get(URL, headers=HEADERS, timeout=20)
    soup = BeautifulSoup(res.text, "html.parser")

    cards = soup.select(".server-card")[:20]
    servers = []

    for card in cards:
        name = card.select_one(".server-name")
        desc = card.select_one(".server-description")
        invite = card.select_one("a.invite-button")
        tags = card.select(".tag")

        if not invite:
            continue

        servers.append({
            "name": name.text.strip() if name else "No Name",
            "description": desc.text.strip() if desc else "",
            "invite": "https://disboard.org" + invite["href"],
            "tags": [t.text.strip() for t in tags],
            "fetched_at": datetime.utcnow().isoformat()
        })

    return servers

servers = fetch_servers()

with open("servers.json", "w", encoding="utf-8") as f:
    json.dump(servers, f, ensure_ascii=False, indent=2)

print("Saved", len(servers), "servers")
