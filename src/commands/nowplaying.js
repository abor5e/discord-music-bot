const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Show the currently playing song')
        .setDescriptionLocalization('ar', 'عرض الأغنية الحالية'),

    async execute(interaction, client) {
        const queue = client.distube.getQueue(interaction.guildId);
        if (!queue) return interaction.reply({ embeds: [{ color: 0xff4444, description: '❌ لا يوجد موسيقى!' }], ephemeral: true });

        const song = queue.songs[0];
        const currentTime = queue.currentTime;
        const duration = song.duration;

        const progress = duration
            ? buildProgressBar(currentTime, duration)
            : '🔴 بث مباشر';

        const embed = new EmbedBuilder()
            .setColor(0x1db954)
            .setTitle('🎵 يتم التشغيل الآن')
            .setDescription(`**[${song.name}](${song.url})**`)
            .setThumbnail(song.thumbnail)
            .addFields(
                { name: '⏱ الوقت الحالي', value: `\`${formatTime(currentTime)}\` / \`${song.formattedDuration}\``, inline: true },
                { name: '🔊 الصوت', value: `\`${queue.volume}%\``, inline: true },
                { name: '📋 في القائمة', value: `\`${queue.songs.length}\` أغنية`, inline: true },
                { name: '🔁 التكرار', value: ['بدون تكرار', 'تكرار الأغنية', 'تكرار القائمة'][queue.repeatMode], inline: true },
                { name: '⏯ الحالة', value: queue.paused ? '⏸ متوقف' : '▶️ يعمل', inline: true },
                { name: '👤 الطالب', value: song.member?.displayName || song.user?.username || 'غير معروف', inline: true },
                { name: '📊 التقدم', value: progress },
            )
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    },
};

function buildProgressBar(current, total) {
    const BAR_SIZE = 20;
    const filled = Math.round((current / total) * BAR_SIZE);
    const empty = BAR_SIZE - filled;
    return `\`${formatTime(current)}\` ${'▬'.repeat(Math.max(0, filled - 1))}🔘${'▬'.repeat(Math.max(0, empty))} \`${formatTime(total)}\``;
}

function formatTime(s) {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    return h > 0
        ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
        : `${m}:${String(sec).padStart(2, '0')}`;
}
