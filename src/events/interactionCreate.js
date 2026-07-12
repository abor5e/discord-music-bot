const { buildPlayerPanel } = require('../utils/playerPanel');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        // Handle slash commands
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;
            try {
                await command.execute(interaction, client);
            } catch (error) {
                console.error(`Command error [${interaction.commandName}]:`, error);
                const msg = { content: `❌ حدث خطأ: ${error.message}`, ephemeral: true };
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(msg).catch(() => { });
                } else {
                    await interaction.reply(msg).catch(() => { });
                }
            }
            return;
        }

        // Handle button interactions
        if (!interaction.isButton()) return;

        const queue = client.distube.getQueue(interaction.guildId);

        // Helper: check if user is in voice
        const voiceChannel = interaction.member?.voice?.channel;

        // These buttons don't need a queue
        const noQueueNeeded = [];

        if (!queue && !noQueueNeeded.includes(interaction.customId)) {
            return interaction.reply({ content: '❌ لا يوجد موسيقى يتم تشغيلها الآن!', ephemeral: true });
        }

        try {
            await interaction.deferUpdate();
        } catch { return; }

        const song = queue?.songs[0];
        let isPaused = queue?.paused || false;

        switch (interaction.customId) {
            case 'pause':
                await queue.pause();
                isPaused = true;
                break;

            case 'resume':
                await queue.resume();
                isPaused = false;
                break;

            case 'skip':
                if (queue.songs.length <= 1) {
                    await queue.stop();
                    return interaction.followUp({ content: '⏭ انتهت القائمة!', ephemeral: true }).catch(() => { });
                }
                await queue.skip();
                return;

            case 'prev':
                await queue.previous();
                return;

            case 'stop':
                client.playerPanels.delete(interaction.guildId);
                await queue.stop();
                await interaction.message.delete().catch(() => { });
                await interaction.followUp({
                    embeds: [{
                        color: 0xff4444,
                        description: '⏹ **تم إيقاف الموسيقى وتفريغ القائمة.**',
                    }],
                    ephemeral: false
                }).catch(() => { });
                return;

            case 'rewind15':
                try {
                    const currentTime = Math.max(0, (queue.currentTime || 0) - 15);
                    await queue.seek(currentTime);
                } catch (e) {
                    await interaction.followUp({ content: '⚠️ لا يمكن الترجيع لهذا الملف.', ephemeral: true }).catch(() => { });
                }
                break;

            case 'forward15':
                try {
                    const fwdTime = (queue.currentTime || 0) + 15;
                    await queue.seek(fwdTime);
                } catch (e) {
                    await interaction.followUp({ content: '⚠️ لا يمكن التقديم لهذا الملف.', ephemeral: true }).catch(() => { });
                }
                break;

            case 'loop':
                const nextMode = (queue.repeatMode + 1) % 3;
                await queue.setRepeatMode(nextMode);
                const modeNames = ['بدون تكرار', 'تكرار الأغنية', 'تكرار القائمة'];
                await interaction.followUp({ content: `🔁 **وضع التكرار:** ${modeNames[nextMode]}`, ephemeral: true }).catch(() => { });
                break;

            case 'shuffle':
                await queue.shuffle();
                await interaction.followUp({ content: '🔀 **تم خلط القائمة!**', ephemeral: true }).catch(() => { });
                break;

            case 'queue':
                const songs = queue.songs.slice(0, 10);
                const queueList = songs.map((s, i) => `\`${i + 1}.\` [${s.name}](${s.url}) • \`${s.formattedDuration}\``).join('\n');
                await interaction.followUp({
                    embeds: [{
                        color: 0x1db954,
                        title: `📋 قائمة التشغيل (${queue.songs.length} أغنية)`,
                        description: queueList || 'القائمة فارغة',
                        footer: { text: queue.songs.length > 10 ? `و ${queue.songs.length - 10} أغنية إضافية...` : '' },
                    }],
                    ephemeral: true,
                }).catch(() => { });
                return;

            case 'nowplaying':
                if (!song) return;
                await interaction.followUp({
                    embeds: [{
                        color: 0x1db954,
                        title: '🎵 يتم التشغيل الآن',
                        description: `**[${song.name}](${song.url})**`,
                        thumbnail: { url: song.thumbnail },
                        fields: [
                            { name: '⏱ المدة', value: `\`${song.formattedDuration}\``, inline: true },
                            { name: '🔊 الصوت', value: `\`${queue.volume}%\``, inline: true },
                        ],
                    }],
                    ephemeral: true,
                }).catch(() => { });
                return;

            case 'vol_10':
                await queue.setVolume(10);
                break;
            case 'vol_50':
                await queue.setVolume(50);
                break;
            case 'vol_100':
                await queue.setVolume(100);
                break;
            case 'vol_150':
                await queue.setVolume(150);
                break;
            case 'vol_200':
                await queue.setVolume(200);
                break;

            case 'vol_up':
                const newVolUp = Math.min(200, (queue.volume || 100) + 10);
                await queue.setVolume(newVolUp);
                break;

            case 'vol_down':
                const newVolDown = Math.max(0, (queue.volume || 100) - 10);
                await queue.setVolume(newVolDown);
                break;

            case 'clearqueue':
                queue.songs.splice(1);
                await interaction.followUp({ content: '🗑️ **تم مسح قائمة التشغيل!**', ephemeral: true }).catch(() => { });
                break;

            case 'autoplay':
                const newAutoplay = !queue.autoplay;
                queue.autoplay = newAutoplay;
                await interaction.followUp({ content: `🤖 **التشغيل التلقائي:** ${newAutoplay ? '✅ مفعّل' : '❌ مغلق'}`, ephemeral: true }).catch(() => { });
                break;

            case 'lyrics':
                await interaction.followUp({
                    content: `📝 ابحث عن كلمات **${song?.name}** على:\nhttps://genius.com/search?q=${encodeURIComponent(song?.name || '')}`,
                    ephemeral: true,
                }).catch(() => { });
                return;

            default:
                return;
        }

        // Refresh the player panel
        if (queue && song) {
            const updatedQueue = client.distube.getQueue(interaction.guildId);
            if (!updatedQueue) return;
            const { embed, rows } = buildPlayerPanel(
                updatedQueue.songs[0] || song,
                updatedQueue,
                updatedQueue.paused
            );
            await interaction.message.edit({ embeds: [embed], components: rows }).catch(() => { });
        }
    },
};
