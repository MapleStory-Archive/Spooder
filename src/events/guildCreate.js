const db = require('../util/database/index.js');

module.exports = {
    name: 'guildCreate',
    async execute(guild) {
        console.log(`Bot has joined ${guild.name} server`);
        const Guild = await db.Guild.findOne({ id: guild.id });

        if (Guild) {
            return;
        }
        else {
            db.Guild.create({ id: guild.id, name: guild.name });
            return console.log(`${guild.name} added into database.`);
        }
    },
};
