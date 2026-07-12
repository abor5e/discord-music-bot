const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Show the current queue')
        .setDescriptionLocalization('ar', 'عرض قائمة التشغيل')
        .addIntegerOption(opt =>
            opt.setName('page')
                .setDescription('Page number')
                .setDescriptionLocalization('ar', 'رقم الصفحة')
                .setMinValue(1)
                .setRequired(false)
        ),

    async execute(interaction, client) {
        const queue = client.distube.getQueue(interaction.guildId);
        if (!queue || !queue.songs.length) {
            return interaction.reply({
                embeds: [{ color: 0xff4444, description: '❌ القائمة فارغة!' }],
                ephemeral: true,
            });
        }

        const page = interaction.options.getInteger('page') || 1;
        const perPage = 10;
        const totalPages = Math.ceil(queue.songs.length / perPage);
        const start = (page - 1) * perPage;
        const songs = queue.songs.slice(start, start + perPage);

        const list = songs.map((s, i) => {
            const num = start + i;
            const prefix = num === 0 ? '🎵' : `\`${num}.\``;
            const label = num === 0 ? '**يتم تشغيله الآن**' : s.name;
            return `${prefix} [${label}](${s.url}) • \`${s.formattedDuration}\``;
        }).join('\n');

        const totalDuration = queue.songs.reduce((a, s) => a + s.duration, 0);
        const fmt = s => `${Math.floor(s / 3600)}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

        return interaction.reply({
            embeds: [{
                color: 0x1db954,
                title: `📋 قائمة التشغيل — الصفحة ${page}/${totalPages}`,
                description: list,
                footer: {
                    text: `${queue.songs.length} أغنية • المدة الكلية: ${fmt(totalDuration)} • الصوت: ${queue.volume}% • التكرار: ${['لا', 'أغنية', 'قائمة'][queue.repeatMode]}`
                },
            }],
        });
    },
};
