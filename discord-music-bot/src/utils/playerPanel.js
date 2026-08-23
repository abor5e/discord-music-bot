const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

function msToTime(ms) {
    if (!ms || ms < 0) return '0:00';
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0
        ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
        : `${m}:${String(sec).padStart(2, '0')}`;
}

function buildProgress(position, total) {
    if (!total) return '🔴 بث مباشر';
    const BAR = 18;
    const ratio = Math.min((position || 0) / total, 1);
    const filled = Math.round(ratio * BAR);
    return `\`${msToTime(position)}\` ${'▬'.repeat(Math.max(0, filled - 1))}🔘${'▬'.repeat(Math.max(0, BAR - filled))} \`${msToTime(total)}\``;
}

// Loop cycle order: none → track → queue → none
const LOOP_ICONS = { none: '🔁', track: '🔂', queue: '🔁' };
const LOOP_LABELS = { none: '', track: '', queue: '🔁' };

function buildPlayerPanel(track, player, isPaused) {
    const loop = player.loop || 'none';
    const filterName = player.data?.get?.('currentFilter') || 'clear';

    const embed = new EmbedBuilder()
        .setColor(0x1db954)
        .setTitle('🎵 يتم التشغيل الآن')
        .setDescription(`## [${track.title}](${track.uri})`)
        .setThumbnail(track.thumbnail || null)
        .addFields(
            { name: '🎤 الفنان', value: track.author || 'غير معروف', inline: true },
            { name: '🔊 الصوت', value: `\`${player.volume}%\``, inline: true },
            { name: '🔁 التكرار', value: loop === 'track' ? '🔂 أغنية' : loop === 'queue' ? '🔁 قائمة' : '⏹ إيقاف', inline: true },
            { name: '📊 التقدم', value: buildProgress(player.position, track.length) },
        )
        .setFooter({ text: `📋 ${player.queue.size} في الانتظار${track.requester ? ` • طُلبت من ${track.requester.username || ''}` : ''}` });

    // ── Row 1: ▶  ⏮  ⏸/▶  ⏭ ──────────────────────────────────────────────
    const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('resume')
            .setEmoji('▶️')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('prev')
            .setEmoji('⏮')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId(isPaused ? 'resume' : 'pause')
            .setEmoji(isPaused ? '▶️' : '⏸')
            .setStyle(isPaused ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('skip')
            .setEmoji('⏭')
            .setStyle(ButtonStyle.Secondary),
    );

    // ── Row 2: 🔂 loop (solo) ───────────────────────────────────────────────
    const loopStyle = loop === 'track' ? ButtonStyle.Primary : loop === 'queue' ? ButtonStyle.Success : ButtonStyle.Secondary;
    const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('loop')
            .setEmoji(loop === 'track' ? '🔂' : '🔁')
            .setStyle(loopStyle),
    );

    // ── Row 3: 🔈  ⏪  ⏩ ────────────────────────────────────────────────────
    const row3 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('vol_down')
            .setEmoji('🔈')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('rewind15')
            .setEmoji('⏪')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('forward15')
            .setEmoji('⏩')
            .setStyle(ButtonStyle.Secondary),
    );

    // ── Row 4: 🔊 vol up (solo) ─────────────────────────────────────────────
    const row4 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('vol_up')
            .setEmoji('🔊')
            .setStyle(ButtonStyle.Secondary),
    );

    // ── Row 5: 🔀  ✕  🔽 ────────────────────────────────────────────────────
    const row5 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('shuffle')
            .setEmoji('🔀')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('stop')
            .setEmoji('✖️')
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId('filter_menu')
            .setEmoji('🔽')
            .setStyle(filterName !== 'clear' ? ButtonStyle.Primary : ButtonStyle.Secondary),
    );

    return { embed, rows: [row1, row2, row3, row4, row5] };
}

module.exports = { buildPlayerPanel, msToTime };
