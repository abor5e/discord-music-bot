const playCommand = require('../commands/play');
const stopCommand = require('../commands/stop');
const skipCommand = require('../commands/skip');

function makeInteraction(message, query) {
    const reply = async (payload) => {
        if (typeof payload === 'string') return message.reply(payload);
        const cleanPayload = { ...payload };
        delete cleanPayload.ephemeral;
        return message.reply(cleanPayload);
    };

    return {
        guildId: message.guildId,
        channelId: message.channelId,
        channel: message.channel,
        member: message.member,
        user: message.author,
        options: {
            getString: () => query,
        },
        deferReply: async () => {},
        editReply: async (payload) => {
            if (typeof payload === 'string') return message.reply(payload);
            const cleanPayload = { ...payload };
            delete cleanPayload.ephemeral;
            return message.reply(cleanPayload);
        },
        reply,
    };
}

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot || !message.guild) return;

        const content = message.content.trim();
        if (!content) return;

        if (content === 'وقف') {
            await stopCommand.execute(makeInteraction(message, ''), client);
            return;
        }

        if (content === 'س' || content === 'سكب') {
            await skipCommand.execute(makeInteraction(message, ''), client);
            return;
        }

        if (content === 'ش' || content.startsWith('ش ') || content === 'شغل' || content.startsWith('شغل ')) {
            const commandLength = content.startsWith('شغل') ? 3 : 1;
            const query = content.slice(commandLength).trim();
            if (!query) {
                await message.reply('❌ اكتب اسم الأغنية بعد الأمر: `ش اسم الأغنية`');
                return;
            }
            await playCommand.execute(makeInteraction(message, query), client);
        }
    },
};