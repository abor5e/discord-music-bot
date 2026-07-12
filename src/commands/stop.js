const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop music and clear the queue')
        .setDescriptionLocalization('ar', 'أوقف الموسيقى وامسح القائمة'),

    async execute(interaction, client) {
        const queue = client.distube.getQueue(interaction.guildId);
        if (!queue) {
            return interaction.reply({
                embeds: [{ color: 0xff4444, description: '❌ لا يوجد موسيقى يتم تشغيلها!' }],
                ephemeral: true,
            });
        }

        client.playerPanels.delete(interaction.guildId);
        await queue.stop();

        return interaction.reply({
            embeds: [{ color: 0xff4444, description: '⏹ **تم إيقاف الموسيقى وتفريغ القائمة.**' }],
        });
    },
};
