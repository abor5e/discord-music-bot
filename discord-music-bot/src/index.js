require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { Kazagumo } = require('kazagumo');
const { Connectors } = require('shoukaku');
const fs = require('fs');
const path = require('path');
const { buildPlayerPanel } = require('./utils/playerPanel');
const { getGuildConfig } = require('./utils/guildConfig');

if (!process.env.DISCORD_TOKEN) {
    console.error('❌ DISCORD_TOKEN is missing!');
    process.exit(1);
}

// Fallback AFK channel name if guild has no saved config yet
const DEFAULT_AFK_CHANNEL_NAME = 'موسيقى';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.commands    = new Collection();
client.playerPanels = new Map(); // guildId → { messageId, channel }

const NODES = [
    { name: 'Jirayu',    url: 'lavalink.jirayu.net:13592', auth: 'youshallnotpass', secure: false },
    { name: 'Horizxon',  url: 'll.horizxon.tech:80',        auth: 'youshallnotpass', secure: false },
    { name: 'Horizxon2', url: 'lavalink.horizxon.tech:80',  auth: 'youshallnotpass', secure: false },
];

client.kazagumo = new Kazagumo(
    {
        defaultSearchEngine: 'youtube',
        send: (guildId, payload) => {
            const guild = client.guilds.cache.get(guildId);
            if (guild) guild.shard.send(payload);
        },
    },
    new Connectors.DiscordJS(client),
    NODES,
);

// ── Load commands ──────────────────────────────────────────────────────────────
const commandsPath = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'))) {
    const cmd = require(path.join(commandsPath, file));
    if (cmd.data && cmd.execute) client.commands.set(cmd.data.name, cmd);
}

// ── Load events ────────────────────────────────────────────────────────────────
const eventsPath = path.join(__dirname, 'events');
for (const file of fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'))) {
    const ev = require(path.join(eventsPath, file));
    if (ev.once) client.once(ev.name, (...a) => ev.execute(...a, client));
    else         client.on(ev.name,  (...a) => ev.execute(...a, client));
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Find the AFK voice channel in a guild — saved ID first, then fallback by name */
function findAfkChannel(guild) {
    const cfg = getGuildConfig(guild.id);
    if (cfg.afkChannelId) {
        const ch = guild.channels.cache.get(cfg.afkChannelId);
        if (ch) return ch;
    }
    // Fallback: look for channel named "موسيقى"
    return guild.channels.cache.find(
        ch => ch.type === 2 /* GuildVoice */ && ch.name === DEFAULT_AFK_CHANNEL_NAME
    ) || null;
}

/** Join (or re-join) the AFK channel for a guild, creating a silent player */
async function joinAfkChannel(guild) {
    const voiceChannel = findAfkChannel(guild);
    if (!voiceChannel) return; // channel doesn't exist in this guild

    try {
        let player = client.kazagumo.getPlayer(guild.id);
        if (player) return; // already connected

        player = await client.kazagumo.createPlayer({
            guildId: guild.id,
            voiceId: voiceChannel.id,
            textId:  null,
            deaf:    true,
            volume:  100,
        });
        console.log(`✅ Joined AFK channel [${AFK_CHANNEL_NAME}] in guild: ${guild.name}`);
    } catch (e) {
        console.error(`❌ Failed to join AFK channel in ${guild.name}:`, e.message);
    }
}

// ── Auto-join AFK channel when bot is ready ────────────────────────────────────
client.once('clientReady', async () => {
    // Wait a moment for Lavalink to connect before joining channels
    setTimeout(async () => {
        for (const guild of client.guilds.cache.values()) {
            await joinAfkChannel(guild);
        }
    }, 5000);
});

// Join AFK channel when bot joins a new guild
client.on('guildCreate', async (guild) => {
    setTimeout(() => joinAfkChannel(guild), 3000);
});

// If someone manually kicks the bot from voice → rejoin immediately
client.on('voiceStateUpdate', async (oldState, newState) => {
    if (oldState.member?.id !== client.user.id) return;
    // Bot was disconnected (moved out or kicked)
    if (oldState.channelId && !newState.channelId) {
        const guild = oldState.guild;
        console.warn(`⚠️ Bot was kicked from voice in ${guild.name}, rejoining...`);
        setTimeout(() => joinAfkChannel(guild), 2000);
    }
});

// ── Panel helper ───────────────────────────────────────────────────────────────
async function sendPanel(player, track) {
    const { embed, rows } = buildPlayerPanel(track, player, false);
    try {
        const panelData = client.playerPanels.get(player.guildId);
        if (panelData) {
            try {
                const msg = await panelData.channel.messages.fetch(panelData.messageId);
                await msg.edit({ embeds: [embed], components: rows });
                return;
            } catch { /* message was deleted */ }
        }
        const ch = player.data.get('textChannel');
        if (!ch) return;
        const msg = await ch.send({ embeds: [embed], components: rows });
        client.playerPanels.set(player.guildId, { messageId: msg.id, channel: ch });
    } catch (e) { console.error('Panel error:', e.message); }
}

// ── Kazagumo Events ────────────────────────────────────────────────────────────

client.kazagumo.on('playerStart', async (player, track) => {
    await sendPanel(player, track);
});

client.kazagumo.on('playerEnd', () => {
    // Next track triggers playerStart automatically
});

client.kazagumo.on('playerEmpty', async (player) => {
    // Queue finished — delete the now-playing panel, stay silent, NEVER leave
    client.playerPanels.delete(player.guildId);
    // No message, no auto-leave — bot stays in channel forever
});

client.kazagumo.on('playerException', async (player, data) => {
    console.error('Player exception:', data);
    const ch = player.data.get('textChannel');
    try {
        if (ch) await ch.send({ embeds: [{ color: 0xff0000, description: `❌ **خطأ في التشغيل:** ${data?.exception?.message || 'خطأ غير معروف'}` }] });
    } catch { }
});

client.kazagumo.on('playerError', (player, data) => {
    console.error('Player error:', data);
});

client.kazagumo.on('playerDestroy', async (player) => {
    client.playerPanels.delete(player.guildId);
    // If player was destroyed for any reason, rejoin the AFK channel
    const guild = client.guilds.cache.get(player.guildId);
    if (guild) {
        setTimeout(() => joinAfkChannel(guild), 3000);
    }
});

// Shoukaku node events
client.kazagumo.shoukaku.on('ready', (name) => console.log(`✅ Lavalink Node connected: ${name}`));
client.kazagumo.shoukaku.on('error', (name, e) => console.error(`❌ Lavalink Node error [${name}]:`, e.message));
client.kazagumo.shoukaku.on('close', (name, code, reason) => console.warn(`⚠️ Lavalink Node closed [${name}]: ${code} ${reason}`));

client.login(process.env.DISCORD_TOKEN);
