const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { saveGuildConfig, getGuildConfig } = require('../utils/guildConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setafk')
        .setDescription('حدد الروم الصوتي الذي يعيش فيه البوت ويشغّل فيه الأغاني')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addChannelOption(opt =>
            opt.setName('channel')
                .setDescription('الروم الصوتي — اتركه فارغاً لاستخدام رومك الحالي')
                .addChannelTypes(ChannelType.GuildVoice)
                .setRequired(false)
        ),

    async execute(interaction, client) {
        // Resolve target channel: option → user's current voice → error
        let voiceChannel = interaction.options.getChannel('channel');
        if (!voiceChannel) {
            voiceChannel = interaction.member?.voice?.channel;
        }
        if (!voiceChannel) {
            return interaction.reply({
                embeds: [{ color: 0xff4444, description: '❌ **حدد روم صوتي أو ادخل روم أولاً!**' }],
                ephemeral: true,
            });
        }

        await interaction.deferReply();

        // Save to guild config
        saveGuildConfig(interaction.guildId, { afkChannelId: voiceChannel.id, afkChannelName: voiceChannel.name });

        // Move bot to new channel immediately
        try {
            let player = client.kazagumo.getPlayer(interaction.guildId);
            if (player) {
                // If a song is playing, stop it before moving
                await player.destroy().catch(() => {});
            }

            player = await client.kazagumo.createPlayer({
                guildId: interaction.guildId,
                voiceId: voiceChannel.id,
                textId:  interaction.channelId,
                deaf:    true,
                volume:  100,
            });

            // Remember the text channel for future song events
            player.data.set('textChannel', interaction.channel);

            await interaction.editReply({
                embeds: [{
                    color: 0x1db954,
                    title: '✅ تم تحديد الروم',
                    description: `البوت سيعيش الآن في **${voiceChannel.name}** ويشغّل الأغاني فيه.\nاستخدم \`/play\` من هذا الروم.`,
                    footer: { text: 'الإعداد محفوظ — يبقى حتى بعد إعادة التشغيل' },
                }],
            });
        } catch (e) {
            console.error('setafk error:', e);
            await interaction.editReply({
                embeds: [{ color: 0xff4444, description: `❌ فشلت في الانضمام للروم: ${e.message}` }],
            });
        }
    },
};
