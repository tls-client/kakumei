import requests
from bs4 import BeautifulSoup
import time

BASE = "https://disboard.org"
LIST_URL = "https://disboard.org/ja/servers?sort=updated"
HEADERS = {"User-Agent": "Mozilla/5.0"}

def fetch_servers():
    res = requests.get(LIST_URL, headers=HEADERS, timeout=10)
    soup = BeautifulSoup(res.text, "html.parser")

    cards = soup.select(".server-card")[:5]
    servers = []

    for card in cards:
        name = card.select_one(".server-name")
        desc = card.select_one(".server-description")
        tags = card.select(".tag")

        detail_link = card.select_one("a.server-card")
        if not detail_link:
            continue

        detail_url = BASE + detail_link["href"]

        try:
            detail_res = requests.get(detail_url, headers=HEADERS, timeout=10)
            detail_soup = BeautifulSoup(detail_res.text, "html.parser")
            invite_btn = detail_soup.select_one("a.join-server-button")
            if not invite_btn:
                continue

            invite = invite_btn["href"]
        except Exception as e:
            print("Detail fetch error:", e)
            continue

        servers.append({
            "name": name.text.strip() if name else "No Name",
            "description": desc.text.strip() if desc else "",
            "invite": invite,
            "tags": [t.text.strip() for t in tags]
        })

        time.sleep(1) 

    print("Fetched servers:", len(servers))
    return servers
