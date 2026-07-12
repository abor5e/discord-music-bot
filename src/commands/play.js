const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setNameLocalization('ar', 'شغل')
        .setDescription('Play a song or playlist')
        .setDescriptionLocalization('ar', 'شغّل أغنية أو قائمة تشغيل')
        .addStringOption(opt =>
            opt.setName('query')
                .setNameLocalization('ar', 'بحث')
                .setDescription('Song name or URL')
                .setDescriptionLocalization('ar', 'اسم الأغنية أو الرابط')
                .setRequired(true)
        ),

    async execute(interaction, client) {
        const query = interaction.options.getString('query');
        const voiceChannel = interaction.member?.voice?.channel;

        if (!voiceChannel) {
            return interaction.reply({
                embeds: [{
                    color: 0xff4444,
                    description: '❌ **يجب أن تكون في قناة صوتية أولاً!**',
                }],
                ephemeral: true,
            });
        }

        const botMember = interaction.guild.members.me;
        if (botMember?.voice?.channel && botMember.voice.channel.id !== voiceChannel.id) {
            return interaction.reply({
                embeds: [{
                    color: 0xff4444,
                    description: '❌ **البوت يعمل في قناة صوتية أخرى!**',
                }],
                ephemeral: true,
            });
        }

        await interaction.deferReply();

        try {
            await client.distube.play(voiceChannel, query, {
                textChannel: interaction.channel,
                member: interaction.member,
            });

            await interaction.editReply({
                embeds: [{
                    color: 0x1db954,
                    description: `🔍 **جاري البحث عن:** \`${query}\``,
                }],
            });
        } catch (error) {
            console.error('Play error:', error);
            await interaction.editReply({
                embeds: [{
                    color: 0xff4444,
                    description: `❌ **خطأ في التشغيل:** ${error.message}`,
                }],
            });
        }
    },
};
