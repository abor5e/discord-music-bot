const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Remove a song from the queue')
        .setDescriptionLocalization('ar', 'احذف أغنية من القائمة')
        .addIntegerOption(opt =>
            opt.setName('position')
                .setNameLocalization('ar', 'رقم')
                .setDescription('Song position in the queue (1 = first in queue, not current)')
                .setDescriptionLocalization('ar', 'موضع الأغنية في القائمة')
                .setMinValue(1)
                .setRequired(true)
        ),

    async execute(interaction, client) {
        const queue = client.distube.getQueue(interaction.guildId);
        if (!queue) return interaction.reply({ embeds: [{ color: 0xff4444, description: '❌ لا يوجد موسيقى!' }], ephemeral: true });

        const pos = interaction.options.getInteger('position');
        if (pos >= queue.songs.length) {
            return interaction.reply({ embeds: [{ color: 0xff4444, description: `❌ لا يوجد أغنية في الموضع \`${pos}\`!` }], ephemeral: true });
        }

        const removed = queue.songs.splice(pos, 1)[0];
        return interaction.reply({
            embeds: [{ color: 0x1db954, description: `🗑️ **تم حذف:** ${removed.name}` }],
        });
    },
};
