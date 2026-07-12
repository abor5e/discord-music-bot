const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Set the volume (0-200)')
        .setDescriptionLocalization('ar', 'اضبط مستوى الصوت (0-200)')
        .addIntegerOption(opt =>
            opt.setName('amount')
                .setNameLocalization('ar', 'قيمة')
                .setDescription('Volume level (0-200)')
                .setDescriptionLocalization('ar', 'مستوى الصوت 0-200')
                .setMinValue(0)
                .setMaxValue(200)
                .setRequired(true)
        ),

    async execute(interaction, client) {
        const queue = client.distube.getQueue(interaction.guildId);
        if (!queue) return interaction.reply({ embeds: [{ color: 0xff4444, description: '❌ لا يوجد موسيقى!' }], ephemeral: true });

        const vol = interaction.options.getInteger('amount');
        await queue.setVolume(vol);

        const bar = buildVolumeBar(vol);
        return interaction.reply({
            embeds: [{
                color: 0x1db954,
                description: `🔊 **تم ضبط الصوت على \`${vol}%\`**\n${bar}`,
            }],
        });
    },
};

function buildVolumeBar(volume) {
    const total = 20;
    const filled = Math.round((volume / 200) * total);
    const empty = total - filled;
    return `🔉 \`${'█'.repeat(filled)}${'░'.repeat(empty)}\` 🔊`;
}
