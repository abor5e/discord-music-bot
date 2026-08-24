# Discord Music Bot

A Discord music bot powered by Kazagumo, Shoukaku, and Lavalink.

## Features

- 🎵 Play music from YouTube by name or URL
- 🔊 Volume control (0–200%)
- ⏭ Next / ⏮ Previous song
- 🔁 Loop mode (off / song / queue)
- 🔀 Shuffle queue
- 📋 View the queue
- ⏹ Stop and clear queue
- 🗑️ Clear queue

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/discord-music-bot.git
cd discord-music-bot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
DISCORD_TOKEN=your_discord_bot_token_here
DISCORD_CLIENT_ID=your_client_id_here
```

#### Where to get these values:
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new Application → Bot
3. Copy the **Bot Token** → `DISCORD_TOKEN`
4. Copy the **Application/Client ID** → `DISCORD_CLIENT_ID`

### 4. Invite the bot to your server

Generate an invite URL:
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=3165184&scope=bot+applications.commands
```

Replace `YOUR_CLIENT_ID` with your actual Client ID.

Required permissions:
- Connect
- Speak
- Send Messages
- Embed Links
- Read Message History
- Use Slash Commands

### 5. Deploy slash commands

```bash
npm run deploy
```

### 6. Start the bot

```bash
npm start
```

## Commands

Slash commands are registered globally. Discord can take up to one hour to
propagate new or changed commands to every server.

### Quick text commands

You can also control the bot by writing directly in the text chat:

```text
ش اسم الأغنية
شغل اسم الأغنية
وقف
س
سكب
```

- `ش` or `شغل` — play a song or playlist
- `وقف` — stop playback and clear the queue
- `س` or `سكب` — skip the current song

| Command | Description |
|---------|-------------|
| `/play <query>` | Play a song or playlist |
| `/stop` | Stop music and clear queue |
| `/skip` | Skip to next song |
| `/previous` | Go back to previous song |
| `/pause` | Pause playback |
| `/resume` | Resume playback |
| `/volume <0-200>` | Set volume level |
| `/queue` | Show the current queue |
| `/loop` | Toggle loop mode |
| `/shuffle` | Shuffle the queue |
| `/nowplaying` | Show current song info |
| `/seek <seconds>` | Jump to timestamp |
| `/remove <position>` | Remove song from queue |

## Direct text controls

The bot can also be controlled without a slash prefix:

```text
ش اسم الأغنية
شغل اسم الأغنية
وقف
س
سكب
ص 100
ت
```

- `ش` or `شغل` — play a song or playlist
- `وقف` — stop playback and clear the queue without leaving the voice channel
- `س` or `سكب` — skip the current song
- `ص 0-200` — set volume
- `ت` — cycle repeat mode

## Requirements

- Node.js 20+
- A reachable Lavalink server
