const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('seek').setDescription('الانتقال لوقت معين (ثوان)')
        .addIntegerOption(opt => opt.setName('seconds').setDescription('الوقت بالثواني').setMinValue(0).setRequired(true)),
    async execute(interaction, client) {
        const player = client.kazagumo.getPlayer(interaction.guildId);
        if (!player) return interaction.reply({ embeds: [{ color: 0xff4444, description: '❌ لا يوجد موسيقى!' }], ephemeral: true });
        const sec = interaction.options.getInteger('seconds');
        await player.shoukaku.seekTo(sec * 1000);
        const m = Math.floor(sec / 60), s = sec % 60;
        return interaction.reply({ embeds: [{ color: 0x1db954, description: `⏩ **تم الانتقال إلى:** \`${m}:${String(s).padStart(2, '0')}\`` }] });
    },
};
