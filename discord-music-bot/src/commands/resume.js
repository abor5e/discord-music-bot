const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder().setName('resume').setDescription('استئناف التشغيل'),
    async execute(interaction, client) {
        const player = client.kazagumo.getPlayer(interaction.guildId);
        if (!player) return interaction.reply({ embeds: [{ color: 0xff4444, description: '❌ لا يوجد موسيقى!' }], ephemeral: true });
        if (!player.paused) return interaction.reply({ embeds: [{ color: 0xffaa00, description: '⚠️ الموسيقى تعمل بالفعل!' }], ephemeral: true });
        player.pause(false);
        return interaction.reply({ embeds: [{ color: 0x1db954, description: '▶️ **تم استئناف التشغيل.**' }] });
    },
};
