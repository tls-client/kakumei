import os
import json
import asyncio
import discord
import requests
from discord.ext import tasks
from webserver import start_webserver

TOKEN = os.getenv("DISCORD_TOKEN")
CHANNEL_ID = int(os.getenv("CHANNEL_ID"))

JSON_URL = "https://raw.githubusercontent.com/tls-client/kakumei/main/servers.json"

POSTED_FILE = "posted.json"

intents = discord.Intents.default()
client = discord.Client(intents=intents)

if os.path.exists(POSTED_FILE):
    with open(POSTED_FILE, "r") as f:
        posted = json.load(f)
else:
    posted = []

@client.event
async def on_ready():
    print(f"✅ Logged in as {client.user}")
    check_updates.start()

@tasks.loop(minutes=10)
async def check_updates():
    await client.wait_until_ready()
    channel = client.get_channel(CHANNEL_ID)

    try:
        res = requests.get(JSON_URL, timeout=15)
        servers = res.json()
    except Exception as e:
        print("JSON取得エラー:", e)
        return

    new_posts = []

    for server in servers:
        if server["invite"] not in posted:
            new_posts.append(server)
            posted.append(server["invite"])

    for s in new_posts[:5]:
        embed = discord.Embed(
            title=s["name"],
            description=s["description"][:200] or "説明なし",
            url=s["invite"],
            color=0x5865F2
        )
        embed.add_field(name="タグ", value=", ".join(s["tags"]) or "なし")
        await channel.send(embed=embed)
        await asyncio.sleep(2)

    with open(POSTED_FILE, "w") as f:
        json.dump(posted, f)

start_webserver()
client.run(TOKEN)
