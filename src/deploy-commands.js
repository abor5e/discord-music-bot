require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if (command.data) {
        commands.push(command.data.toJSON());
    }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log(`🔄 Registering ${commands.length} slash commands...`);

        let data;
        if (process.env.DISCORD_GUILD_ID) {
            // Guild commands (instant, for testing)
            data = await rest.put(
                Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID),
                { body: commands }
            );
            console.log(`✅ Registered ${data.length} guild commands for guild ${process.env.DISCORD_GUILD_ID}`);
        } else {
            // Global commands (up to 1 hour delay)
            data = await rest.put(
                Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
                { body: commands }
            );
            console.log(`✅ Registered ${data.length} global slash commands`);
        }
    } catch (error) {
        console.error('❌ Failed to register commands:', error);
    }
})();
