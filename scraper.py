import requests
from bs4 import BeautifulSoup

URL = "https://disboard.org/ja/servers?sort=updated"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
}

def fetch_servers():
    try:
        res = requests.get(URL, headers=HEADERS, timeout=15)
        res.raise_for_status()
    except Exception as e:
        print("Request failed:", e)
        return []

    soup = BeautifulSoup(res.text, "html.parser")

    cards = soup.select("div.server-card, div[class*='server'], div[class*='card']")
    print("Fetched cards:", len(cards))

    servers = []

    for card in cards[:15]:
        try:
            name_tag = card.select_one("div.server-name, span.server-name, h3")
            desc_tag = card.select_one("div.server-description, div.description")
            invite_tag = card.find("a", href=True)

            if not invite_tag:
                continue

            href = invite_tag["href"]

            if "/server/" not in href and "discord.gg" not in href:
                continue

            invite_link = href if href.startswith("http") else "https://disboard.org" + href

            tags = [t.text.strip() for t in card.select(".tag, .badge") if t.text.strip()]

            servers.append({
                "name": name_tag.text.strip() if name_tag else "No Name",
                "description": desc_tag.text.strip() if desc_tag else "",
                "invite": invite_link,
                "tags": tags
            })

        except Exception as e:
            print("Parse error:", e)

    print("Servers parsed:", len(servers))
    return servers
