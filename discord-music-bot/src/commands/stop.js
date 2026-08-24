const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder().setName('stop').setDescription('إيقاف الموسيقى وتفريغ القائمة'),
    async execute(interaction, client) {
        const player = client.kazagumo.getPlayer(interaction.guildId);
        if (!player) return interaction.reply({ embeds: [{ color: 0xff4444, description: '❌ لا يوجد موسيقى!' }], ephemeral: true });
        client.playerPanels.delete(interaction.guildId);
        player.setLoop('none');
        player.queue.clear();
        if (player.queue.current) player.skip();
        return interaction.reply({ embeds: [{ color: 0xff4444, description: '⏹ **تم إيقاف الموسيقى وتفريغ القائمة.**' }] });
    },
};
