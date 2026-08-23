const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder().setName('previous').setDescription('تشغيل الأغنية السابقة'),
    async execute(interaction, client) {
        const player = client.kazagumo.getPlayer(interaction.guildId);
        if (!player) return interaction.reply({ embeds: [{ color: 0xff4444, description: '❌ لا يوجد موسيقى!' }], ephemeral: true });
        const prevTrack = player.getPrevious(true);
        if (!prevTrack) return interaction.reply({ embeds: [{ color: 0xff4444, description: '❌ لا توجد أغنية سابقة!' }], ephemeral: true });
        if (player.queue.current) player.queue.unshift(player.queue.current);
        player.queue.current = prevTrack;
        await player.play();
        return interaction.reply({ embeds: [{ color: 0x1db954, description: `⏮ **يتم تشغيل الأغنية السابقة:** ${prevTrack.title}` }] });
    },
};
