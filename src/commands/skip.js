const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip the current song')
        .setDescriptionLocalization('ar', 'انتقل للأغنية التالية'),

    async execute(interaction, client) {
        const queue = client.distube.getQueue(interaction.guildId);
        if (!queue) {
            return interaction.reply({
                embeds: [{ color: 0xff4444, description: '❌ لا يوجد موسيقى يتم تشغيلها!' }],
                ephemeral: true,
            });
        }

        if (queue.songs.length <= 1) {
            await queue.stop();
            return interaction.reply({
                embeds: [{ color: 0xff4444, description: '⏭ لا توجد أغنية تالية. تم إيقاف التشغيل.' }],
            });
        }

        await queue.skip();
        return interaction.reply({
            embeds: [{ color: 0x1db954, description: `⏭ **تم التخطي!** الأغنية التالية: **${queue.songs[1]?.name}**` }],
        });
    },
};
