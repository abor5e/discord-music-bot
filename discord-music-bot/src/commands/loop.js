const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop').setDescription('ضبط وضع التكرار')
        .addStringOption(opt =>
            opt.setName('mode').setDescription('وضع التكرار').setRequired(false)
                .addChoices(
                    { name: '❌ بدون تكرار', value: 'none' },
                    { name: '🔂 تكرار الأغنية', value: 'track' },
                    { name: '🔁 تكرار القائمة', value: 'queue' },
                )
        ),
    async execute(interaction, client) {
        const player = client.kazagumo.getPlayer(interaction.guildId);
        if (!player) return interaction.reply({ embeds: [{ color: 0xff4444, description: '❌ لا يوجد موسيقى!' }], ephemeral: true });
        const mode = interaction.options.getString('mode');
        if (mode) player.setLoop(mode);
        else player.setLoop();
        const labels = { none: '❌ بدون تكرار', track: '🔂 تكرار الأغنية', queue: '🔁 تكرار القائمة' };
        return interaction.reply({ embeds: [{ color: 0x1db954, description: `**وضع التكرار:** ${labels[player.loop]}` }] });
    },
};
