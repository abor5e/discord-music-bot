const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('previous')
        .setDescription('Play the previous song')
        .setDescriptionLocalization('ar', 'شغّل الأغنية السابقة'),

    async execute(interaction, client) {
        const queue = client.distube.getQueue(interaction.guildId);
        if (!queue) return interaction.reply({ embeds: [{ color: 0xff4444, description: '❌ لا يوجد موسيقى!' }], ephemeral: true });

        try {
            await queue.previous();
            return interaction.reply({ embeds: [{ color: 0x1db954, description: '⏮ **يتم تشغيل الأغنية السابقة!**' }] });
        } catch (e) {
            return interaction.reply({ embeds: [{ color: 0xff4444, description: '❌ لا توجد أغنية سابقة!' }], ephemeral: true });
        }
    },
};
