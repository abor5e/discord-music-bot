require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { DisTube } = require('distube');
const { YtDlpPlugin } = require('@distube/yt-dlp');
const fs = require('fs');
const path = require('path');
const { buildPlayerPanel } = require('./utils/playerPanel');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.commands = new Collection();

// Store message IDs for player panels per guild
client.playerPanels = new Map();

// Initialize DisTube
client.distube = new DisTube(client, {
    plugins: [new YtDlpPlugin({ update: false })],
    emitNewSongOnly: false,
    joinNewVoiceChannel: true,
    nsfw: false,
});

// Load commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
    }
}

// Load events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(path.join(eventsPath, file));
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

// DisTube Events
client.distube
    .on('playSong', async (queue, song) => {
        const { embed, rows } = buildPlayerPanel(song, queue, false);
        try {
            const panelData = client.playerPanels.get(queue.id);
            if (panelData) {
                try {
                    const msg = await panelData.channel.messages.fetch(panelData.messageId);
                    await msg.edit({ embeds: [embed], components: rows });
                    return;
                } catch { }
            }
            const msg = await queue.textChannel.send({ embeds: [embed], components: rows });
            client.playerPanels.set(queue.id, { messageId: msg.id, channel: queue.textChannel });
        } catch (e) {
            console.error('playSong panel error:', e.message);
        }
    })
    .on('addSong', async (queue, song) => {
        try {
            await queue.textChannel.send({
                embeds: [{
                    color: 0x1db954,
                    description: `✅ **تمت الإضافة للقائمة:** [${song.name}](${song.url})\n⏱ المدة: \`${song.formattedDuration}\` | الموضع: \`#${queue.songs.length}\``,
                }]
            });
        } catch { }
    })
    .on('addList', async (queue, playlist) => {
        try {
            await queue.textChannel.send({
                embeds: [{
                    color: 0x1db954,
                    description: `✅ **تمت إضافة قائمة التشغيل:** ${playlist.name}\n🎵 **${playlist.songs.length}** أغنية`,
                }]
            });
        } catch { }
    })
    .on('error', async (channel, error) => {
        console.error('DisTube Error:', error);
        try {
            if (channel) {
                await channel.send({
                    embeds: [{
                        color: 0xff0000,
                        description: `❌ **خطأ:** ${error.message}`,
                    }]
                });
            }
        } catch { }
    })
    .on('finish', async (queue) => {
        client.playerPanels.delete(queue.id);
        try {
            await queue.textChannel.send({
                embeds: [{
                    color: 0x888888,
                    description: '⏹ **انتهت قائمة التشغيل.** استخدم `/play` لتشغيل المزيد!',
                }]
            });
        } catch { }
    })
    .on('disconnect', (queue) => {
        client.playerPanels.delete(queue.id);
    })
    .on('empty', async (queue) => {
        try {
            await queue.textChannel.send({
                embeds: [{
                    color: 0xffaa00,
                    description: '🔇 **القناة الصوتية فارغة.** سأغادر بعد قليل...',
                }]
            });
        } catch { }
    });

client.login(process.env.DISCORD_TOKEN);
