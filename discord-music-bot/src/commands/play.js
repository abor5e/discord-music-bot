const { SlashCommandBuilder } = require('discord.js');
const { getGuildConfig } = require('../utils/guildConfig');

const DEFAULT_AFK_CHANNEL_NAME = 'موسيقى';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('تشغيل أغنية أو قائمة تشغيل من YouTube')
        .addStringOption(opt =>
            opt.setName('query')
                .setDescription('اسم الأغنية أو رابط YouTube')
                .setRequired(true)
        ),
    async execute(interaction, client) {
        const query = interaction.options.getString('query');
        const voiceChannel = interaction.member?.voice?.channel;

        // Resolve the configured AFK channel for this guild
        const cfg = getGuildConfig(interaction.guildId);
        const afkChannelId   = cfg.afkChannelId   || null;
        const afkChannelName = cfg.afkChannelName  || DEFAULT_AFK_CHANNEL_NAME;

        // Must be in a voice channel
        if (!voiceChannel) {
            return interaction.reply({
                embeds: [{ color: 0xff4444, description: `❌ **لازم تكون في روم "${afkChannelName}" الصوتي أولاً!**` }],
                ephemeral: true,
            });
        }

        // Must be in the AFK channel (check by saved ID, or by name as fallback)
        const inAfkChannel = afkChannelId
            ? voiceChannel.id === afkChannelId
            : voiceChannel.name === DEFAULT_AFK_CHANNEL_NAME;

        if (!inAfkChannel) {
            return interaction.reply({
                embeds: [{ color: 0xff4444, description: `❌ **البوت شغّال فقط في روم "${afkChannelName}"!\nادخل الروم الصح وعاود.**` }],
                ephemeral: true,
            });
        }

        await interaction.deferReply();

        try {
            const result = await client.kazagumo.search(query, { requester: interaction.user });

            if (!result || result.tracks.length === 0) {
                return interaction.editReply({
                    embeds: [{ color: 0xff4444, description: `❌ **ما لقيت نتائج لـ:** \`${query}\`` }],
                });
            }

            let player = client.kazagumo.getPlayer(interaction.guildId);
            if (!player) {
                player = await client.kazagumo.createPlayer({
                    guildId: interaction.guildId,
                    voiceId: voiceChannel.id,
                    textId:  interaction.channelId,
                    deaf:    true,
                    volume:  100,
                });
            }

            player.data.set('textChannel', interaction.channel);

            const isPlaylist = result.type === 'PLAYLIST';
            if (isPlaylist) {
                player.queue.add(result.tracks);
                await interaction.editReply({
                    embeds: [{
                        color: 0x1db954,
                        description: `✅ **تمت إضافة قائمة التشغيل:** ${result.playlistName || 'قائمة تشغيل'}\n🎵 **${result.tracks.length}** أغنية`,
                    }],
                });
            } else {
                player.queue.add(result.tracks[0]);
                if (player.playing || player.paused) {
                    await interaction.editReply({
                        embeds: [{
                            color: 0x1db954,
                            description: `✅ **تمت الإضافة للقائمة:** [${result.tracks[0].title}](${result.tracks[0].uri})\n⏱ الموضع: \`#${player.queue.size}\``,
                        }],
                    });
                } else {
                    await interaction.editReply({
                        embeds: [{ color: 0x1db954, description: `🔍 **جاري تحميل:** \`${result.tracks[0].title}\`` }],
                    });
                }
            }

            if (!player.playing && !player.paused) {
                await player.play();
            }
        } catch (error) {
            console.error('Play error:', error);
            await interaction.editReply({
                embeds: [{ color: 0xff4444, description: `❌ **خطأ:** ${error.message}` }],
            });
        }
    },
};
