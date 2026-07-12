const { SlashCommandBuilder } = require('discord.js');

module.exports = require('./pause.js') && {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resume the paused song')
        .setDescriptionLocalization('ar', 'استئناف التشغيل'),

    async execute(interaction, client) {
        const queue = client.distube.getQueue(interaction.guildId);
        if (!queue) return interaction.reply({ embeds: [{ color: 0xff4444, description: '❌ لا يوجد موسيقى!' }], ephemeral: true });
        if (!queue.paused) return interaction.reply({ embeds: [{ color: 0xffaa00, description: '⚠️ الموسيقى تعمل بالفعل!' }], ephemeral: true });

        await queue.resume();
        return interaction.reply({ embeds: [{ color: 0x1db954, description: '▶️ **تم استئناف التشغيل.**' }] });
    },
};
