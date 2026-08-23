const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder().setName('pause').setDescription('إيقاف مؤقت للأغنية الحالية'),
    async execute(interaction, client) {
        const player = client.kazagumo.getPlayer(interaction.guildId);
        if (!player) return interaction.reply({ embeds: [{ color: 0xff4444, description: '❌ لا يوجد موسيقى!' }], ephemeral: true });
        if (player.paused) return interaction.reply({ embeds: [{ color: 0xffaa00, description: '⚠️ الموسيقى متوقفة مسبقاً!' }], ephemeral: true });
        player.pause(true);
        return interaction.reply({ embeds: [{ color: 0xffaa00, description: '⏸ **تم الإيقاف المؤقت.**' }] });
    },
};
