const fs   = require('fs');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, '../../data/guild-configs.json');

function loadAll() {
    try {
        if (!fs.existsSync(CONFIG_FILE)) return {};
        return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    } catch { return {}; }
}

function saveAll(data) {
    const dir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function getGuildConfig(guildId) {
    return loadAll()[guildId] || {};
}

function saveGuildConfig(guildId, partial) {
    const all = loadAll();
    all[guildId] = { ...(all[guildId] || {}), ...partial };
    saveAll(all);
}

module.exports = { getGuildConfig, saveGuildConfig };
