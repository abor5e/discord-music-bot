const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('seek')
        .setDescription('Jump to a specific time in the song')
        .setDescriptionLocalization('ar', 'انتقل لوقت محدد في الأغنية')
        .addIntegerOption(opt =>
            opt.setName('seconds')
                .setNameLocalization('ar', 'ثواني')
                .setDescription('Time in seconds')
                .setDescriptionLocalization('ar', 'الوقت بالثواني')
                .setMinValue(0)
                .setRequired(true)
        ),

    async execute(interaction, client) {
        const queue = client.distube.getQueue(interaction.guildId);
        if (!queue) return interaction.reply({ embeds: [{ color: 0xff4444, description: '❌ لا يوجد موسيقى!' }], ephemeral: true });

        const sec = interaction.options.getInteger('seconds');
        try {
            await queue.seek(sec);
            const m = Math.floor(sec / 60);
            const s = sec % 60;
            return interaction.reply({
                embeds: [{ color: 0x1db954, description: `⏩ **تم الانتقال إلى:** \`${m}:${String(s).padStart(2, '0')}\`` }],
            });
        } catch (e) {
            return interaction.reply({ embeds: [{ color: 0xff4444, description: `❌ لا يمكن الانتقال: ${e.message}` }], ephemeral: true });
        }
    },
};
