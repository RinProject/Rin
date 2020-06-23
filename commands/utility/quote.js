module.exports = {
	async run(message, args) {
        const { MessageEmbed } = require('discord.js');

		// Get message from channel
        if (message.mentions.channels.first())
        {
            const channelid = message.mentions.channels.first().id;
            const channel = message.guild.channels.cache.get(channelid)

            if (channel.members.get(message.author.id) == undefined || null)
            {
                return message.channel.send(new MessageEmbed()
                .setTitle('An error occurred.')
                .setColor('RED')
                .setDescription('You do not have permission to view this channel.')
                )
            }

            if (args[2] === undefined)
            {
                return message.channel.send(new MessageEmbed()
                .setTitle('An error occurred.')
                .setColor('RED')
                .setDescription('Please provide a message ID.')
                )
            }
    
            channel.messages.fetch(args[2]).then(found => {
                if (message.guild.id != found.guild.id) 
                {
                    return message.channel.send(new MessageEmbed()
                    .setColor('RED')
                    .setTitle('An error occurred.')
                    .setDescription('You may not quote a message from another server.')
                    )
                }

                if (found.attachments.size >= 1)
                {
                const attachments = found.attachments.array();
                const attachmentFieldBody = [];
                found.attachments.tap(attachment => {
                    attachmentFieldBody.push(attachment.url)
                    })
                    if (/\.(gif|jpg|jpeg|png)$/i.test(attachments[0].url))
                    {
                        const embed = new MessageEmbed()
                        .setColor(found.member.displayColor)
                        .setAuthor(found.author.username, found.author.avatarURL({size: 512, dynamic: true}), null)
                        .setDescription(`${found.content}\n\n [Jump To Message](${found.url})`)
                        .setImage(attachments[0].url)
                        .setFooter(`#${found.channel.name}`)
                        .setTimestamp(found.createdAt)
                        return message.channel.send(embed);
                    }

                    else 
                    {
                        const embed = new MessageEmbed()
                        .setColor(found.member.displayColor)
                        .setAuthor(found.author.username, found.author.avatarURL({size: 512, dynamic: true}), null)
                        .setDescription(`${found.content}\n\n [Jump To Message](${found.url})`)
                        .setFooter(`#${found.channel.name}`)
                        .setTimestamp(found.createdAt)
                        message.channel.send(embed)
                        return message.channel.send('I can only embed gif, jpg, jpeg, & png attachments, you appear to have quoted an attachment outside of these categories.')
                        .then(message => message.delete(5000))
                    }
                }
    
                const embed = new MessageEmbed()
                .setColor(found.member.displayColor)
                .setAuthor(found.author.username, found.author.avatarURL({size: 512, dynamic: true}), null)
                .setDescription(`${found.content}\n\n [Jump To Message](${found.url})`)
                .setFooter(`#${found.channel.name}`)
                .setTimestamp(found.createdAt)
                message.channel.send(embed)
            }).catch(e => { return handleError(e) })
        }
        
        else {
        message.channel.messages.fetch(args[1]).then(found => {
            if (found.attachments.size >= 1)
                {
                const attachments = found.attachments.array();
                const attachmentFieldBody = [];
                found.attachments.tap(attachment => {
                    attachmentFieldBody.push(attachment.url)
                    })
                    if (/\.(gif|jpg|jpeg|png)$/i.test(attachments[0].url))
                    {
                        const embed = new MessageEmbed()
                        .setColor(found.member.displayColor)
                        .setAuthor(found.author.username, found.author.avatarURL({size: 512, dynamic: true}), null)
                        .setDescription(`${found.content}\n\n [Jump To Message](${found.url})`)
                        .setImage(attachments[0].url)
                        .setFooter(`#${found.channel.name}`)
                        .setTimestamp(found.createdAt)
                        return message.channel.send(embed);
                    }
                    else 
                    {
                        const embed = new MessageEmbed()
                        .setColor(found.member.displayColor)
                        .setAuthor(found.author.username, found.author.avatarURL({size: 512, dynamic: true}), null)
                        .setDescription(`${found.content}\n\n [Jump To Message](${found.url})`)
                        .setFooter(`#${found.channel.name}`)
                        .setTimestamp(found.createdAt)
                        message.channel.send(embed)
                        return message.channel.send('I can only embed gif, jpg, jpeg, & png attachments, you appear to have quoted an attachment outside of these categories.')
                        .then(message => message.delete(5000))
                    }
                }
    
            const embed = new MessageEmbed()
            .setColor(found.member.displayColor)
            .setAuthor(found.author.username, found.author.avatarURL({size: 512, dynamic: true}), null)
            .setDescription(`${found.content}\n\n [Jump To Message](${found.url})`)
            .setFooter(`#${found.channel.name}`)
            .setTimestamp(found.createdAt)
            message.channel.send(embed)
        }).catch(e => { return handleError(e) })
    }

    function handleError(e) {
        if (e)
            { 
        if (e.message == 'Missing Access')
        {
            return message.channel.send(new MessageEmbed()
                .setColor('RED')
                .setTitle('An unknown error occurred.')
                .setDescription('Please make sure I can view the given channel.')
                )
        }  
                return message.channel.send(new MessageEmbed()
                .setColor('RED')
                .setTitle('An unknown error occurred.')
                .setDescription('Please make sure a valid message ID was entered.')
                )
            }
        }
    },
    aliases: ['q'],
	description: 'Quotes a message.',
	detailed: 'Quotes a message.',
	examples: prefix => `${prefix}quote <messageID> OR ${prefix}quote #channel <messageID>`,
	name: 'quote',
	perms: null
}
