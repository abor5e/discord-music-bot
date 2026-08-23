const { SlashCommandBuilder } = require('discord.js');

// Lavalink filter presets
const FILTERS = {
    clear: {
        label: '✨ صوت نظيف (افتراضي)',
        payload: {
            equalizer: [],
            timescale: {},
            tremolo: {},
            vibrato: {},
            rotation: {},
            distortion: {},
            channelMix: {},
            lowPass: {},
        },
    },

    bassboost: {
        label: '🔊 Bass Boost (تعزيز الجهير)',
        payload: {
            equalizer: [
                { band: 0, gain: 0.3 },
                { band: 1, gain: 0.25 },
                { band: 2, gain: 0.2 },
                { band: 3, gain: 0.1 },
                { band: 4, gain: 0.05 },
                { band: 5, gain: -0.05 },
                { band: 6, gain: -0.1 },
                { band: 7, gain: -0.1 },
                { band: 8, gain: -0.1 },
                { band: 9, gain: -0.1 },
                { band: 10, gain: -0.1 },
                { band: 11, gain: -0.1 },
                { band: 12, gain: -0.1 },
                { band: 13, gain: -0.1 },
            ],
        },
    },

    nightcore: {
        label: '🌙 Nightcore (صوت عالي وسريع)',
        payload: {
            timescale: { speed: 1.2, pitch: 1.3, rate: 1.0 },
            equalizer: [],
        },
    },

    vaporwave: {
        label: '🌊 Vaporwave (صوت بطيء)',
        payload: {
            timescale: { speed: 0.8, pitch: 0.85, rate: 1.0 },
            equalizer: [
                { band: 1, gain: 0.3 },
                { band: 0, gain: 0.3 },
            ],
        },
    },

    '8d': {
        label: '🎧 8D Audio (صوت محيطي)',
        payload: {
            rotation: { rotationHz: 0.2 },
            equalizer: [],
        },
    },

    karaoke: {
        label: '🎤 Karaoke (حذف الصوت)',
        payload: {
            karaoke: { level: 1.0, monoLevel: 1.0, filterBand: 220.0, filterWidth: 100.0 },
            equalizer: [],
        },
    },

    soft: {
        label: '🎵 Soft (صوت ناعم)',
        payload: {
            lowPass: { smoothing: 20.0 },
            equalizer: [
                { band: 0, gain: -0.05 },
                { band: 1, gain: 0.05 },
                { band: 2, gain: 0.1 },
                { band: 3, gain: 0.15 },
                { band: 4, gain: 0.13 },
                { band: 5, gain: 0.1 },
            ],
        },
    },

    treble: {
        label: '🔆 Treble Boost (تعزيز الحدة)',
        payload: {
            equalizer: [
                { band: 0, gain: -0.1 },
                { band: 1, gain: -0.1 },
                { band: 2, gain: -0.05 },
                { band: 5, gain: 0.1 },
                { band: 6, gain: 0.15 },
                { band: 7, gain: 0.2 },
                { band: 8, gain: 0.25 },
                { band: 9, gain: 0.3 },
                { band: 10, gain: 0.3 },
                { band: 11, gain: 0.3 },
                { band: 12, gain: 0.3 },
                { band: 13, gain: 0.3 },
            ],
        },
    },

    echo: {
        label: '🔁 Echo (صدى)',
        payload: {
            // Using Lavalink's plugin echo filter if supported, else distortion approach
            echo: { delay: 300, decay: 0.4 },
            equalizer: [],
        },
    },
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('filter')
        .setDescription('تطبيق فلاتر صوتية على التشغيل')
        .addStringOption(opt =>
            opt.setName('preset')
                .setDescription('اختر الفلتر')
                .setRequired(true)
                .addChoices(
                    { name: '✨ صوت نظيف (افتراضي)', value: 'clear' },
                    { name: '🔊 Bass Boost (تعزيز الجهير)', value: 'bassboost' },
                    { name: '🌙 Nightcore (صوت عالي وسريع)', value: 'nightcore' },
                    { name: '🌊 Vaporwave (صوت بطيء)', value: 'vaporwave' },
                    { name: '🎧 8D Audio (صوت محيطي)', value: '8d' },
                    { name: '🎤 Karaoke (حذف الصوت)', value: 'karaoke' },
                    { name: '🎵 Soft (صوت ناعم)', value: 'soft' },
                    { name: '🔆 Treble Boost (تعزيز الحدة)', value: 'treble' },
                    { name: '🔁 Echo (صدى)', value: 'echo' },
                )
        ),
    async execute(interaction, client) {
        const player = client.kazagumo.getPlayer(interaction.guildId);
        if (!player) {
            return interaction.reply({ embeds: [{ color: 0xff4444, description: '❌ لا يوجد موسيقى يتم تشغيلها!' }], ephemeral: true });
        }

        const preset = interaction.options.getString('preset');
        const filter = FILTERS[preset];
        if (!filter) {
            return interaction.reply({ embeds: [{ color: 0xff4444, description: '❌ فلتر غير معروف!' }], ephemeral: true });
        }

        await interaction.deferReply();

        try {
            // Apply filters via Shoukaku
            await player.shoukaku.setFilters(filter.payload);
            player.data.set('currentFilter', preset);

            await interaction.editReply({
                embeds: [{
                    color: 0x1db954,
                    title: '🎛️ تم تطبيق الفلتر',
                    description: `**${filter.label}**`,
                    footer: { text: 'استخدم /filter clear لإزالة جميع الفلاتر' },
                }],
            });
        } catch (error) {
            console.error('Filter error:', error);
            await interaction.editReply({
                embeds: [{ color: 0xff4444, description: `❌ خطأ في تطبيق الفلتر: ${error.message}` }],
            });
        }
    },
};
