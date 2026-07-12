const { ActivityType } = require('discord.js');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`✅ Bot is online as ${client.user.tag}`);
        console.log(`📡 Serving ${client.guilds.cache.size} server(s)`);

        client.user.setPresence({
            activities: [
                {
                    name: '/play | 🎵 Music Bot',
                    type: ActivityType.Listening,
                },
            ],
            status: 'online',
        });
    },
};
