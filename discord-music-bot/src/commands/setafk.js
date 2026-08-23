const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { saveGuildConfig, getGuildConfig } = require('../utils/guildConfig');

const DEFAULT_AFK_CHANNEL_NAME = 'موسيقى';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setafk')
        .setDescription('إدخال البوت إلى روم الصوت الثابت: موسيقى')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction, client) {
        // The AFK channel is intentionally fixed by name. The command may be
        // sent from any text channel and never changes the configured channel.
        const voiceChannel = interaction.guild?.channels.cache.find(
            channel => channel.type === 2 && channel.name === DEFAULT_AFK_CHANNEL_NAME
        );
        if (!voiceChannel) {
            return interaction.reply({
                embeds: [{ color: 0xff4444, description: `❌ **أنشئ رومًا صوتيًا اسمه "${DEFAULT_AFK_CHANNEL_NAME}" أولاً.**` }],
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
                    description: `البوت سيعيش الآن في **${voiceChannel.name}** ويشغّل الأغاني فيه.\nاستخدم \`ش اسم الأغنية\` من هذا الروم.`,
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
