const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder().setName('skip').setDescription('تخطي الأغنية الحالية'),
    async execute(interaction, client) {
        const player = client.kazagumo.getPlayer(interaction.guildId);
        if (!player) return interaction.reply({ embeds: [{ color: 0xff4444, description: '❌ لا يوجد موسيقى!' }], ephemeral: true });
        const nextTrack = player.queue[0];
        player.skip();
        return interaction.reply({ embeds: [{ color: 0x1db954, description: nextTrack ? `⏭ **تم التخطي!** التالية: **${nextTrack.title}**` : '⏭ **آخر أغنية! سيتوقف البوت.**' }] });
    },
};
