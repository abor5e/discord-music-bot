# 🎵 Discord Music Bot

A feature-rich Discord music bot with a full interactive control panel.

## Features

- 🎵 Play music from YouTube by name or URL
- 🎛️ Full control panel with interactive buttons on every song
- 🔊 Volume control (0–200%)
- ⏩ Fast forward / rewind 15 seconds
- ⏭ Next / ⏮ Previous song
- 🔁 Loop mode (off / song / queue)
- 🔀 Shuffle queue
- 📋 View the queue
- ⏸ Pause / ▶️ Resume
- ⏹ Stop and clear queue
- 🤖 Autoplay toggle
- 📝 Lyrics search link
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

### 3. Install yt-dlp (required for music playback)

```bash
# Linux/Mac
pip install yt-dlp
# or
brew install yt-dlp

# Windows
winget install yt-dlp
```

### 4. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
DISCORD_TOKEN=your_discord_bot_token_here
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_GUILD_ID=your_guild_id_here  # optional, for faster testing
```

#### Where to get these values:
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new Application → Bot
3. Copy the **Bot Token** → `DISCORD_TOKEN`
4. Copy the **Application/Client ID** → `DISCORD_CLIENT_ID`
5. (Optional) Your server's ID → `DISCORD_GUILD_ID`

### 5. Invite the bot to your server

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

### 6. Deploy slash commands

```bash
npm run deploy
```

### 7. Start the bot

```bash
npm start
```

## Commands

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

## Control Panel Buttons

When a song starts, a control panel with buttons appears automatically:

**Row 1 — Playback:**
⏮ Previous | ⏪ -15s | ⏸/▶️ Pause/Resume | ⏩ +15s | ⏭ Next

**Row 2 — Queue Management:**
🔁 Loop | 🔀 Shuffle | 📋 Queue | 🎵 Now Playing | ⏹ Stop

**Row 3 — Volume Presets:**
🔉 10% | 🔊 50% | 🔊 100% | 🔊 150% | 📢 200%

**Row 4 — Extra Controls:**
🔽 Vol-10 | 🔼 Vol+10 | 🗑️ Clear Queue | 🤖 Autoplay | 📝 Lyrics

## Requirements

- Node.js 18+
- Python 3 + yt-dlp (for music streaming)
- FFmpeg (usually included via `ffmpeg-static`)
