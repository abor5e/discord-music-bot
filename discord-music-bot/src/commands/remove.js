const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove').setDescription('حذف أغنية من القائمة بالموضع')
        .addIntegerOption(opt => opt.setName('position').setDescription('الموضع (1 = أول أغنية في الانتظار)').setMinValue(1).setRequired(true)),
    async execute(interaction, client) {
        const player = client.kazagumo.getPlayer(interaction.guildId);
        if (!player) return interaction.reply({ embeds: [{ color: 0xff4444, description: '❌ لا يوجد موسيقى!' }], ephemeral: true });
        const pos = interaction.options.getInteger('position') - 1;
        if (pos < 0 || pos >= player.queue.size) {
            return interaction.reply({ embeds: [{ color: 0xff4444, description: `❌ لا يوجد أغنية في الموضع \`${pos + 1}\`!` }], ephemeral: true });
        }
        const track = player.queue[pos];
        player.queue.remove(pos);
        return interaction.reply({ embeds: [{ color: 0x1db954, description: `🗑️ **تم حذف:** ${track.title}` }] });
    },
};
