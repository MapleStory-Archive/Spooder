const { MessageEmbed } = require('discord.js');
const db = require('../../util/database/index.js');
const { meso } = require('../../util/emoji.json');

module.exports = {
    data: {
        name: 'paycheck',
        description: 'Check your or another player\'s paycheck.',
        options: [{
            name: 'user',
            description: 'Input the user here.',
            type: 6,
            required: false,
        }],
    },
    async execute(interaction) {
        const { guild, options } = interaction;
        const user = options.getUser('user');

        if (!user) {
            const { user } = interaction;
            const Member = await db.Member.findOne({ guildId: guild.id, userId: user.id });

            if (!Member) return await interaction.reply({ embeds: [{ description: 'You have not participated in a boss from this server yet.', color: 'RED' }] });

            const drops = [];

            Member.paychecks.forEach(drop => {
                drops.push(`Drop \`#${drop.number}\`: ${drop.split.toLocaleString()} ${meso}`);
            });

            const embed = new MessageEmbed()
                .setColor('GREEN')
                .setAuthor('Your Paycheck', user.displayAvatarURL({ dynamic: true, format: 'png', size: 2048 }))
                .addField('Pending Payments:', `${drops.length ? drops.join('\n') : 'No pending payments.'}`)
                .addField('Pending Total:', `${Member.payment.toLocaleString()} ${meso}`);

            return await interaction.reply({ embeds: [embed] });
        }
        else {
            const Member = await db.Member.findOne({ guildId: guild.id, userId: user.id });

            if (!Member) return await interaction.reply({ embeds: [{ description: `${user} have not participated in a boss from this server yet.`, color: 'RED' }] });

            const drops = [];

            Member.paychecks.forEach(drop => {
                drops.push(`Drop \`#${drop.number}\`: ${drop.split.toLocaleString()} ${meso}`);
            });

            const embed = new MessageEmbed()
                .setColor('GREEN')
                .setAuthor(`${user.username}'s Paycheck`, user.displayAvatarURL({ dynamic: true, format: 'png', size: 2048 }))
                .addField('Pending Payments:', `${drops.length ? drops.join('\n') : 'No pending payments.'}`)
                .addField('Pending Total:', `${Member.payment.toLocaleString()} ${meso}`);

            return await interaction.reply({ embeds: [embed] });
        }
    },
};
