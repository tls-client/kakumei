import requests
from bs4 import BeautifulSoup

URL = "https://disboard.org/ja/servers?sort=updated"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
}

def fetch_servers():
    try:
        res = requests.get(URL, headers=HEADERS, timeout=30)
        res.raise_for_status()
    except Exception as e:
        print("Request failed:", e)
        return []

    soup = BeautifulSoup(res.text, "html.parser")

    cards = soup.select(".server-card")[:10]
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
            "tags": [t.text.strip() for t in tags]
        })

    print(f"Fetched {len(servers)} servers")
    return servers
