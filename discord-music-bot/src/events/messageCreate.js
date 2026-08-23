const playCommand = require('../commands/play');
const stopCommand = require('../commands/stop');
const skipCommand = require('../commands/skip');
const setAfkCommand = require('../commands/setafk');

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
            getChannel: () => undefined,
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

        if (content === 'افك') {
            if (!message.member.permissions.has('ManageGuild')) {
                await message.reply('❌ تحتاج صلاحية **Manage Server** لتحديد قناة AFK.');
                return;
            }
            await setAfkCommand.execute(makeInteraction(message, ''), client);
            return;
        }

        if (content === 'وقف') {
            await stopCommand.execute(makeInteraction(message, ''), client);
            return;
        }

        if (content === 'س') {
            await skipCommand.execute(makeInteraction(message, ''), client);
            return;
        }

        if (content === 'ش' || content.startsWith('ش ')) {
            const query = content.slice(1).trim();
            if (!query) {
                await message.reply('❌ اكتب اسم الأغنية بعد الأمر: `ش اسم الأغنية`');
                return;
            }
            await playCommand.execute(makeInteraction(message, query), client);
        }
    },
};