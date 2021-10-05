const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const db = require('../../util/database/index.js');
const bossList = require('../../util/bossing/bossList.json');
const itemList = require('../../util/bossing/itemList.json');
const { meso } = require('../../util/emoji.json');

module.exports = {
    data: {
        name: 'sold',
        description: 'Mark an item drop as sold.',
        options: [{
            name: 'drop',
            description: 'Input the drop number here.',
            type: 4,
            required: true,
        }, {
            name: 'price',
            description: 'Input the price the drop was sold for.',
            type: 4,
            required: true,
        }],
    },
    async execute(interaction) {
        const { guild, options, channel } = interaction;
        const Guild = await db.Guild.findOne({ id: guild.id });
        if (!Guild.salesChannelId) return interaction.reply({ embeds: [{ description: 'This server does not have a `sales` channel set up yet. Please use the `setchannel` command to set it up', color: 'YELLOW' }] });
        const salesChannel = guild.channels.cache.get(Guild.salesChannelId);
        if (!salesChannel) return interaction.reply({ embeds: [{ description: 'The `sales` channel does not exist or has been deleted. Please use the `setchannel` command to set it up', color: 'RED' }] });

        const dropNumber = options.getInteger('drop');
        const price = options.getInteger('price');
        const Drop = await db.Drop.findOne({ guildId: guild.id, number: dropNumber });

        if (!Drop) return interaction.reply({ embeds: [{ description: `Drop \`${dropNumber}\` does not exist.`, color: 'RED' }] });
        if (Drop.sold) return interaction.reply({ embeds: [{ description: `Drop \`${dropNumber}\` has already been marked as sold`, color: 'YELLOW' }] });
        if (price < 0) return interaction.reply({ embeds: [{ description: 'You cannot input a negative price', color: 'RED' }] });

        const boss = bossList[Drop.boss.toLowerCase()];
        const item = itemList[Drop.item];
        const dropsChannel = guild.channels.cache.get(Guild.dropsChannelId);
        const dropMsg = await dropsChannel.messages.fetch(Drop.dropMessageId);
        const dropEmbed = dropMsg.embeds[0];
        Drop.price = price;

        const saleEmbed = new MessageEmbed()
            .setColor('GREEN')
            .setAuthor(`Drop #${Drop.number}`, boss.image)
            .setThumbnail(item.image)
            .setTitle(`Boss: ${boss.name}\nItem: ${item.name}`)
            .setDescription(`[View Drop](${dropMsg.url})`)
            .addField('Sold for:', `${Drop.price.toLocaleString()} ${meso}`, true)
            .addField('After 5% tax:', `${Drop.taxed.toLocaleString()} ${meso}`, true)
            .addField(`Split: (${Drop.partySize})`, `${Drop.split.toLocaleString()} ${meso}`);
        const confirmEmbed = new MessageEmbed()
            .setDescription('You have `60 seconds` to upload, confirm, or cancel.\n\nClick the ✅ button to confirm the above information is correct.\nClick the 📸 button to upload an optional image of the drop.\n Click the ❌ button to cancel this action.');
        const row = new MessageActionRow()
            .addComponents([
                new MessageButton()
                    .setCustomId('confirm')
                    .setLabel('Confirm')
                    .setEmoji('✅')
                    .setStyle('SUCCESS'),
                new MessageButton()
                    .setCustomId('image')
                    .setLabel('Upload Image')
                    .setEmoji('📸')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('cancel')
                    .setLabel('Cancel')
                    .setEmoji('❌')
                    .setStyle('DANGER'),
            ]);

        const reply = await interaction.reply({ embeds: [saleEmbed, confirmEmbed], components: [row], fetchReply: true });

        const buttonFilter = i => i.user.id === interaction.user.id && ['confirm', 'image', 'cancel'].includes(i.customId);
        const buttonCollector = reply.createMessageComponentCollector({ filter: buttonFilter, time: 60000 });
        const msgFilter = m => m.author.id === interaction.user.id;
        const msgCollector = channel.createMessageCollector({ filter: msgFilter, max: 1 });

        buttonCollector.on('collect', async i => {
            i.deferUpdate();
            const button = i.customId;

            if (button === 'confirm') {
                const partyMembers = [];

                Drop.party.forEach(member => {
                    partyMembers.push(`<@!${member.userId}>`);
                });

                const image = await interaction.fetchReply().then(reply => {
                    return reply.embeds[0].image.url;
                });

                saleEmbed.setImage('attachment://screenshot.png');
                msgCollector.stop();
                buttonCollector.stop();

                const saleMessage = await salesChannel.send({ content: partyMembers.sort().join(', '), embeds: [saleEmbed], files: [{ attachment: image, name: 'screenshot.png' }] });
                dropEmbed.setImage('attachment://screenshot.png')
                    .setDescription(`Sales Receipt: [Here](${saleMessage.url} 'View Sales Receipt')`)
                    .setFooter(`Sold for: ${price.toLocaleString()}`);
                dropMsg.edit({ embeds: [dropEmbed] });
                await Drop.updateOne({ saleMessageId: saleMessage.id, price, sold: true });
                return interaction.editReply({ embeds: [saleEmbed, { description: `[Drop #${Drop.number}](${dropMsg.url} 'View Drop') has been sucessfully marked as [sold](${saleMessage.url} 'View Sales Receipt').`, color: 'GREEN' }], components: [] });
            }
            else if (button === 'image') {
                const msg = await channel.send({ embeds: [{ description: 'Please upload the image now.\nIt can be either an image file or a image link ending in `.png`, `.jpg`, or `.jpeg`' }] });
                const row = new MessageActionRow()
                    .addComponents([
                        new MessageButton()
                            .setCustomId('confirm')
                            .setLabel('Confirm')
                            .setEmoji('✅')
                            .setStyle('SUCCESS'),
                        new MessageButton()
                            .setCustomId('image')
                            .setLabel('Upload Image')
                            .setEmoji('📸')
                            .setStyle('PRIMARY')
                            .setDisabled(true),
                        new MessageButton()
                            .setCustomId('cancel')
                            .setLabel('Cancel')
                            .setEmoji('❌')
                            .setStyle('DANGER'),
                    ]);

                msgCollector.on('collect', m => {
                    m.delete();
                    saleEmbed.setImage('attachment://screenshot.png');

                    if (m.attachments.size) {
                        interaction.editReply({ embeds: [saleEmbed, confirmEmbed], components: [row], files: [{ attachment: m.attachments.first().url, name: 'screenshot.png' }] });
                    }
                    else if (m.content.endsWith('.png') || m.content.endsWith('.jpg') || m.content.endsWith('.jpeg')) {
                        interaction.editReply({ embeds: [saleEmbed, confirmEmbed], components: [row], files: [{ attachment: m.content, name: 'screenshot.png' }] });
                    }
                    else return;
                });

                msgCollector.on('end', () => {
                    msg.delete();
                });
            }
            else {
                buttonCollector.stop();
                msgCollector.stop();
                return interaction.editReply({ embeds: [saleEmbed, { description: 'Aborted!', color: 'RED' }], components: [] });
            }
        });
    },
};
