const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder().setName('shuffle').setDescription('خلط قائمة التشغيل'),
    async execute(interaction, client) {
        const player = client.kazagumo.getPlayer(interaction.guildId);
        if (!player) return interaction.reply({ embeds: [{ color: 0xff4444, description: '❌ لا يوجد موسيقى!' }], ephemeral: true });
        if (player.queue.size < 2) return interaction.reply({ embeds: [{ color: 0xffaa00, description: '⚠️ تحتاج أغنيتين على الأقل في القائمة!' }], ephemeral: true });
        player.queue.shuffle();
        return interaction.reply({ embeds: [{ color: 0x1db954, description: `🔀 **تم خلط ${player.queue.size} أغنية!**` }] });
    },
};
