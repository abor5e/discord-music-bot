const { buildPlayerPanel, msToTime } = require('../utils/playerPanel');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        // ── Slash commands ────────────────────────────────────────────────────
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;
            try {
                await command.execute(interaction, client);
            } catch (error) {
                console.error(`Command error [${interaction.commandName}]:`, error);
                const msg = { content: `❌ خطأ: ${error.message}`, ephemeral: true };
                if (interaction.replied || interaction.deferred) await interaction.followUp(msg).catch(() => {});
                else await interaction.reply(msg).catch(() => {});
            }
            return;
        }

        // ── Buttons ───────────────────────────────────────────────────────────
        if (!interaction.isButton()) return;

        const player = client.kazagumo.getPlayer(interaction.guildId);
        if (!player || !player.queue.current) {
            return interaction.reply({ content: '❌ لا يوجد موسيقى يتم تشغيلها الآن!', ephemeral: true });
        }

        try { await interaction.deferUpdate(); } catch { return; }

        const track = player.queue.current;

        switch (interaction.customId) {
            case 'pause':
                player.pause(true);
                break;

            case 'resume':
                player.pause(false);
                break;

            case 'skip':
                player.skip();
                return; // playerStart event will refresh panel

            case 'prev': {
                const prevTrack = player.getPrevious(true);
                if (!prevTrack) {
                    await interaction.followUp({ content: '❌ لا توجد أغنية سابقة!', ephemeral: true }).catch(() => {});
                    return;
                }
                if (player.queue.current) player.queue.unshift(player.queue.current);
                player.queue.current = prevTrack;
                await player.play();
                return;
            }

            case 'stop':
                client.playerPanels.delete(interaction.guildId);
                await player.destroy();
                await interaction.message.delete().catch(() => {});
                await interaction.followUp({ embeds: [{ color: 0xff4444, description: '⏹ **تم إيقاف الموسيقى.**' }] }).catch(() => {});
                return;

            case 'rewind15': {
                const pos = Math.max(0, (player.position || 0) - 15000);
                await player.shoukaku.seekTo(pos);
                break;
            }

            case 'forward15': {
                const pos = (player.position || 0) + 15000;
                await player.shoukaku.seekTo(pos);
                break;
            }

            case 'loop':
                player.setLoop();
                break;

            case 'shuffle':
                if (player.queue.size < 2) {
                    await interaction.followUp({ content: '⚠️ تحتاج أغنيتين على الأقل!', ephemeral: true }).catch(() => {});
                    return;
                }
                player.queue.shuffle();
                await interaction.followUp({ content: '🔀 **تم خلط القائمة!**', ephemeral: true }).catch(() => {});
                return;

            case 'queue': {
                const all = player.queue.current ? [player.queue.current, ...player.queue] : [...player.queue];
                const list = all.slice(0, 10).map((t, i) =>
                    `${i === 0 ? '🎵' : `\`${i}.\``} [${t.title}](${t.uri}) • \`${msToTime(t.length)}\``
                ).join('\n');
                await interaction.followUp({
                    embeds: [{ color: 0x1db954, title: `📋 قائمة التشغيل (${all.length})`, description: list || 'فارغة',
                        footer: { text: all.length > 10 ? `و ${all.length - 10} أغنية إضافية...` : '' } }],
                    ephemeral: true,
                }).catch(() => {});
                return;
            }

            case 'nowplaying': {
                const pos = player.position || 0;
                await interaction.followUp({
                    embeds: [{ color: 0x1db954, title: '🎵 يتم التشغيل الآن',
                        description: `**[${track.title}](${track.uri})**`,
                        thumbnail: { url: track.thumbnail || '' },
                        fields: [
                            { name: '⏱ الوقت', value: `\`${msToTime(pos)} / ${msToTime(track.length)}\``, inline: true },
                            { name: '🔊 الصوت', value: `\`${player.volume}%\``, inline: true },
                        ] }],
                    ephemeral: true,
                }).catch(() => {});
                return;
            }

            case 'vol_10':  await player.setVolume(10);  break;
            case 'vol_50':  await player.setVolume(50);  break;
            case 'vol_100': await player.setVolume(100); break;
            case 'vol_150': await player.setVolume(150); break;
            case 'vol_200': await player.setVolume(200); break;

            case 'vol_up':   await player.setVolume(Math.min(200, player.volume + 10)); break;
            case 'vol_down': await player.setVolume(Math.max(0,   player.volume - 10)); break;

            case 'clearqueue':
                player.queue.clear();
                await interaction.followUp({ content: '🗑️ **تم مسح قائمة التشغيل!**', ephemeral: true }).catch(() => {});
                return;

            case 'autoplay':
                await interaction.followUp({ content: '🤖 التشغيل التلقائي غير متاح مع Lavalink.', ephemeral: true }).catch(() => {});
                return;

            case 'lyrics':
                await interaction.followUp({
                    content: `📝 ابحث عن كلمات **${track.title}** على:\nhttps://genius.com/search?q=${encodeURIComponent(track.title)}`,
                    ephemeral: true,
                }).catch(() => {});
                return;

            default:
                return;
        }

        // Refresh panel embed after state change
        const updatedPlayer = client.kazagumo.getPlayer(interaction.guildId);
        if (!updatedPlayer || !updatedPlayer.queue.current) return;
        const { embed, rows } = buildPlayerPanel(updatedPlayer.queue.current, updatedPlayer, updatedPlayer.paused);
        await interaction.message.edit({ embeds: [embed], components: rows }).catch(() => {});
    },
};
