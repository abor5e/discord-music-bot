const { SlashCommandBuilder } = require('discord.js');
const { msToTime } = require('../utils/playerPanel');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue').setDescription('عرض قائمة التشغيل')
        .addIntegerOption(opt => opt.setName('page').setDescription('رقم الصفحة').setMinValue(1)),
    async execute(interaction, client) {
        const player = client.kazagumo.getPlayer(interaction.guildId);
        const queuedTracks = player ? [...player.queue] : [];
        if (!queuedTracks.length) return interaction.reply({ embeds: [{ color: 0xff4444, description: '❌ لا توجد أغانٍ في قائمة الانتظار.' }], ephemeral: true });

        const page = interaction.options.getInteger('page') || 1;
        const perPage = 10;
        const totalPages = Math.ceil(queuedTracks.length / perPage);
        const start = (page - 1) * perPage;
        const tracks = queuedTracks.slice(start, start + perPage);

        const list = tracks.map((t, i) =>
            `\`${start + i + 1}.\` [${t.title}](${t.uri}) • \`${msToTime(t.length)}\``
        ).join('\n');

        const totalMs = queuedTracks.reduce((a, t) => a + (t.length || 0), 0);

        return interaction.reply({
            embeds: [{
                color: 0x1db954,
                title: `📋 قائمة التشغيل — ${page}/${totalPages}`,
                description: list,
                    footer: { text: `${queuedTracks.length} أغنية في الانتظار • المدة الكلية: ${msToTime(totalMs)} • الصوت: ${player.volume}%` },
            }],
        });
    },
};
