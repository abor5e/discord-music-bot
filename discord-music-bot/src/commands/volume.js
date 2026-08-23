const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume').setDescription('ضبط مستوى الصوت (0-200)')
        .addIntegerOption(opt => opt.setName('amount').setDescription('0-200').setMinValue(0).setMaxValue(200).setRequired(true)),
    async execute(interaction, client) {
        const player = client.kazagumo.getPlayer(interaction.guildId);
        if (!player) return interaction.reply({ embeds: [{ color: 0xff4444, description: '❌ لا يوجد موسيقى!' }], ephemeral: true });
        const vol = interaction.options.getInteger('amount');
        await player.setVolume(vol);
        const total = 20, filled = Math.round((vol / 200) * total);
        const bar = `🔉 \`${'█'.repeat(filled)}${'░'.repeat(total - filled)}\` 🔊`;
        return interaction.reply({ embeds: [{ color: 0x1db954, description: `🔊 **الصوت: \`${vol}%\`**\n${bar}` }] });
    },
};
