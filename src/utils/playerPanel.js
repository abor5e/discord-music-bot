const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function buildPlayerPanel(song, queue, isPaused) {
    const loopModes = ['🔁 بدون تكرار', '🔂 تكرار الأغنية', '🔁 تكرار القائمة'];
    const loopMode = loopModes[queue.repeatMode] || loopModes[0];

    const volumeBar = buildVolumeBar(queue.volume);
    const progress = buildProgressBar(song);

    const embed = new EmbedBuilder()
        .setColor(0x1db954)
        .setTitle('🎵 يتم التشغيل الآن')
        .setDescription(`**[${song.name}](${song.url})**`)
        .setThumbnail(song.thumbnail)
        .addFields(
            {
                name: '⏱ المدة',
                value: `\`${song.formattedDuration}\``,
                inline: true
            },
            {
                name: '👤 الطالب',
                value: `${song.member?.displayName || song.user?.username || 'غير معروف'}`,
                inline: true
            },
            {
                name: '🔊 الصوت',
                value: `\`${queue.volume}%\``,
                inline: true
            },
            {
                name: '📋 القائمة',
                value: `\`${queue.songs.length}\` أغنية`,
                inline: true
            },
            {
                name: '🔁 التكرار',
                value: loopMode,
                inline: true
            },
            {
                name: '🔀 الخلط',
                value: queue.autoplay ? '✅ مفعّل' : '❌ مغلق',
                inline: true
            },
            {
                name: '📊 التقدم',
                value: progress,
                inline: false
            },
            {
                name: '🔉 الصوت',
                value: volumeBar,
                inline: false
            }
        )
        .setFooter({ text: `DisTube Music Bot • ${new Date().toLocaleTimeString('ar-SA')}` })
        .setTimestamp();

    // Row 1: Main playback controls
    const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('prev')
            .setLabel('السابقة')
            .setEmoji('⏮')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('rewind15')
            .setLabel('15-')
            .setEmoji('⏪')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId(isPaused ? 'resume' : 'pause')
            .setLabel(isPaused ? 'تشغيل' : 'إيقاف مؤقت')
            .setEmoji(isPaused ? '▶️' : '⏸')
            .setStyle(isPaused ? ButtonStyle.Success : ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('forward15')
            .setLabel('15+')
            .setEmoji('⏩')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('skip')
            .setLabel('التالية')
            .setEmoji('⏭')
            .setStyle(ButtonStyle.Secondary),
    );

    // Row 2: Loop / Shuffle / Queue / Stop
    const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('loop')
            .setLabel('تكرار')
            .setEmoji('🔁')
            .setStyle(queue.repeatMode > 0 ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('shuffle')
            .setLabel('خلط')
            .setEmoji('🔀')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('queue')
            .setLabel('القائمة')
            .setEmoji('📋')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('nowplaying')
            .setLabel('الأغنية الحالية')
            .setEmoji('🎵')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('stop')
            .setLabel('إيقاف')
            .setEmoji('⏹')
            .setStyle(ButtonStyle.Danger),
    );

    // Row 3: Volume controls
    const row3 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('vol_10')
            .setLabel('10%')
            .setEmoji('🔉')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('vol_50')
            .setLabel('50%')
            .setEmoji('🔊')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('vol_100')
            .setLabel('100%')
            .setEmoji('🔊')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('vol_150')
            .setLabel('150%')
            .setEmoji('🔊')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('vol_200')
            .setLabel('200%')
            .setEmoji('📢')
            .setStyle(ButtonStyle.Secondary),
    );

    // Row 4: Volume fine-tune + Clear queue
    const row4 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('vol_down')
            .setLabel('صوت -10')
            .setEmoji('🔽')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('vol_up')
            .setLabel('صوت +10')
            .setEmoji('🔼')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('clearqueue')
            .setLabel('مسح القائمة')
            .setEmoji('🗑️')
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId('autoplay')
            .setLabel('تشغيل تلقائي')
            .setEmoji('🤖')
            .setStyle(queue.autoplay ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('lyrics')
            .setLabel('كلمات الأغنية')
            .setEmoji('📝')
            .setStyle(ButtonStyle.Secondary),
    );

    return { embed, rows: [row1, row2, row3, row4] };
}

function buildProgressBar(song) {
    if (!song.duration || song.isLive) return '🔴 بث مباشر';
    const filled = 20;
    const bar = '▬'.repeat(filled);
    return `\`0:00\` ${bar} \`${song.formattedDuration}\``;
}

function buildVolumeBar(volume) {
    const total = 20;
    const filled = Math.round((volume / 200) * total);
    const empty = total - filled;
    return `🔉 \`${'█'.repeat(filled)}${'░'.repeat(empty)}\` 🔊 \`${volume}%\``;
}

module.exports = { buildPlayerPanel };
