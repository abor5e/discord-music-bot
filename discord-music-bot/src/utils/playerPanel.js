const { EmbedBuilder } = require('discord.js');

function msToTime(ms) {
    if (!ms || ms < 0) return '0:00';
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0
        ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
        : `${m}:${String(sec).padStart(2, '0')}`;
}

function buildPlayerPanel(track, player, isPaused) {
    const loop = player.loop || 'none';

    const embed = new EmbedBuilder()
        .setColor(0x1db954)
        .setTitle('🎵 يتم التشغيل الآن')
        .setDescription(`## [${track.title}](${track.uri})`)
        .setThumbnail(track.thumbnail || null)
        .addFields(
            { name: '🎤 الفنان', value: track.author || 'غير معروف', inline: true },
            { name: '🔊 الصوت', value: `\`${player.volume}%\``, inline: true },
            { name: '🔁 التكرار', value: loop === 'track' ? '🔂 أغنية' : loop === 'queue' ? '🔁 قائمة' : '⏹ إيقاف', inline: true },
        )
        .setFooter({ text: `📋 ${player.queue.size} في الانتظار${track.requester ? ` • طُلبت من ${track.requester.username || ''}` : ''}` });

    return { embed, rows: [] };
}

module.exports = { buildPlayerPanel, msToTime };
