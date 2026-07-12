const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('Shuffle the queue')
        .setDescriptionLocalization('ar', 'خلط قائمة التشغيل'),

    async execute(interaction, client) {
        const queue = client.distube.getQueue(interaction.guildId);
        if (!queue) return interaction.reply({ embeds: [{ color: 0xff4444, description: '❌ لا يوجد موسيقى!' }], ephemeral: true });
        if (queue.songs.length < 2) return interaction.reply({ embeds: [{ color: 0xffaa00, description: '⚠️ القائمة تحتوي على أغنية واحدة فقط!' }], ephemeral: true });

        await queue.shuffle();
        return interaction.reply({
            embeds: [{ color: 0x1db954, description: `🔀 **تم خلط ${queue.songs.length} أغنية!**` }],
        });
    },
};
