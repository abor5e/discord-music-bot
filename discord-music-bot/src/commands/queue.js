const { SlashCommandBuilder } = require('discord.js');
const { msToTime } = require('../utils/playerPanel');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue').setDescription('عرض قائمة التشغيل')
        .addIntegerOption(opt => opt.setName('page').setDescription('رقم الصفحة').setMinValue(1)),
    async execute(interaction, client) {
        const player = client.kazagumo.getPlayer(interaction.guildId);
        if (!player || !player.queue.current) return interaction.reply({ embeds: [{ color: 0xff4444, description: '❌ القائمة فارغة!' }], ephemeral: true });

        const page = interaction.options.getInteger('page') || 1;
        const perPage = 10;
        const allTracks = player.queue.current ? [player.queue.current, ...player.queue] : [...player.queue];
        const totalPages = Math.ceil(allTracks.length / perPage);
        const start = (page - 1) * perPage;
        const tracks = allTracks.slice(start, start + perPage);

        const list = tracks.map((t, i) => {
            const num = start + i;
            return `${num === 0 ? '🎵 **يعزف الآن**' : `\`${num}.\``} [${t.title}](${t.uri}) • \`${msToTime(t.length)}\``;
        }).join('\n');

        const totalMs = allTracks.reduce((a, t) => a + (t.length || 0), 0);

        return interaction.reply({
            embeds: [{
                color: 0x1db954,
                title: `📋 قائمة التشغيل — ${page}/${totalPages}`,
                description: list,
                footer: { text: `${allTracks.length} أغنية • المدة الكلية: ${msToTime(totalMs)} • الصوت: ${player.volume}%` },
            }],
        });
    },
};
