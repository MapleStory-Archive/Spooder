const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const db = require('../../util/database/index.js');

module.exports = {
    data: {
        name: 'parties',
        description: 'View all of the parties in the server.',
    },
    async execute(interaction) {
        const { guild } = interaction;
        const Guild = await db.Guild.findOne({ id: guild.id });
        const roleIds = Guild.parties;
        const roles = await guild.roles.fetch().then(roles => roles.filter(role => roleIds.includes(role.id)).sort((first, second) => first.name - second.name));
        const maxPages = roles.size;
        let index = 0;
        const description = [];

        roles.each(role => {
            const members = role.members.map(member => member).sort((first, second) => first.id - second.id);
            description.push(`**Party:** ${role}\n\n\n**Members:**\n${members.join(', ')}`);
        });

        const embed = new MessageEmbed()
            .setDescription(description[0]);

        if (maxPages > 1) {
            const row = new MessageActionRow()
                .addComponents([
                    new MessageButton()
                        .setCustomId('previous')
                        .setEmoji('⬅️')
                        .setStyle('SECONDARY'),
                    new MessageButton()
                        .setCustomId('next')
                        .setEmoji('➡️')
                        .setStyle('SECONDARY'),
                ]);
            const reply = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });
            const filter = i => {
                i.deferUpdate();
                return i.customId === 'previous' || i.customId === 'next';
            };
            const collector = reply.createMessageComponentCollector({ filter, componentType: 'BUTTON', idle: 15000, dispose: true });
            collector.on('collect', i => {
                if (i.customId === 'next' && index + 1 < maxPages) {
                    index++;
                }
                else if (i.customId === 'previous' && index + 1 > 1) {
                    index--;
                }
                else return;

                embed.setDescription(description[index])
                    .setFooter(`Parties: ${index + 1}/${maxPages}`);


                interaction.editReply({ embeds: [embed], components: [row] });
            });

            collector.on('end', () => {
                interaction.editReply({ components: [] });
            });
        }
        else {
            return interaction.reply({ embeds: [embed] });
        }
    },
};
