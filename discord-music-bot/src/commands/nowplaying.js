const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { msToTime } = require('../utils/playerPanel');

module.exports = {
    data: new SlashCommandBuilder().setName('nowplaying').setDescription('عرض الأغنية الحالية'),
    async execute(interaction, client) {
        const player = client.kazagumo.getPlayer(interaction.guildId);
        if (!player || !player.queue.current) return interaction.reply({ embeds: [{ color: 0xff4444, description: '❌ لا يوجد موسيقى!' }], ephemeral: true });

        const track = player.queue.current;
        const pos = player.position || 0;
        const total = track.length || 0;

        const progressBar = total
            ? (() => {
                const BAR = 20, filled = Math.round((pos / total) * BAR);
                return `\`${msToTime(pos)}\` ${'▬'.repeat(Math.max(0, filled - 1))}🔘${'▬'.repeat(Math.max(0, BAR - filled))} \`${msToTime(total)}\``;
            })()
            : '🔴 بث مباشر';

        const loopLabels = { none: '❌ بدون تكرار', track: '🔂 تكرار الأغنية', queue: '🔁 تكرار القائمة' };

        return interaction.reply({
            embeds: [new EmbedBuilder()
                .setColor(0x1db954)
                .setTitle('🎵 يتم التشغيل الآن')
                .setDescription(`**[${track.title}](${track.uri})**`)
                .setThumbnail(track.thumbnail || null)
                .addFields(
                    { name: '⏱ الوقت', value: `\`${msToTime(pos)} / ${msToTime(total)}\``, inline: true },
                    { name: '🔊 الصوت', value: `\`${player.volume}%\``, inline: true },
                    { name: '🔁 التكرار', value: loopLabels[player.loop] || '❌', inline: true },
                    { name: '📋 في الانتظار', value: `\`${player.queue.size}\` أغنية`, inline: true },
                    { name: '⏯ الحالة', value: player.paused ? '⏸ متوقف' : '▶️ يعمل', inline: true },
                    { name: '🎤 الفنان', value: track.author || 'غير معروف', inline: true },
                    { name: '📊 التقدم', value: progressBar },
                )],
        });
    },
};
