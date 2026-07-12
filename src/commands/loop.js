const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Toggle loop mode (off/song/queue)')
        .setDescriptionLocalization('ar', 'وضع التكرار: بدون / أغنية / قائمة')
        .addStringOption(opt =>
            opt.setName('mode')
                .setNameLocalization('ar', 'وضع')
                .setDescription('Loop mode')
                .setDescriptionLocalization('ar', 'وضع التكرار')
                .setRequired(false)
                .addChoices(
                    { name: '❌ بدون تكرار', value: '0' },
                    { name: '🔂 تكرار الأغنية الحالية', value: '1' },
                    { name: '🔁 تكرار قائمة التشغيل', value: '2' },
                )
        ),

    async execute(interaction, client) {
        const queue = client.distube.getQueue(interaction.guildId);
        if (!queue) return interaction.reply({ embeds: [{ color: 0xff4444, description: '❌ لا يوجد موسيقى!' }], ephemeral: true });

        const modeStr = interaction.options.getString('mode');
        const mode = modeStr !== null ? parseInt(modeStr) : (queue.repeatMode + 1) % 3;

        await queue.setRepeatMode(mode);
        const labels = ['❌ بدون تكرار', '🔂 تكرار الأغنية الحالية', '🔁 تكرار قائمة التشغيل'];

        return interaction.reply({
            embeds: [{ color: 0x1db954, description: `**وضع التكرار:** ${labels[mode]}` }],
        });
    },
};
