const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pause the current song')
        .setDescriptionLocalization('ar', 'توقف مؤقتاً'),

    async execute(interaction, client) {
        const queue = client.distube.getQueue(interaction.guildId);
        if (!queue) return interaction.reply({ embeds: [{ color: 0xff4444, description: '❌ لا يوجد موسيقى!' }], ephemeral: true });
        if (queue.paused) return interaction.reply({ embeds: [{ color: 0xffaa00, description: '⚠️ الموسيقى متوقفة مسبقاً!' }], ephemeral: true });

        await queue.pause();
        return interaction.reply({ embeds: [{ color: 0xffaa00, description: '⏸ **تم الإيقاف المؤقت.**' }] });
    },
};
