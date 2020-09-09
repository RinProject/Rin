module.exports = {
	run: async (message, args)=>
	{
		const channel = message.mentions.channels.first() || message.channel;

		const messageId = args[message.mentions.channels.first() ? 2 : 1];

		if (channel.members.get(message.author.id) == undefined || null)
		{
			return message.channel.send('', {
				embed: {
					title: 'An error occurred.',
					description: 'You do not have permission to view that channel.',
					color: colors.error
				}
			});
		}

		if (messageId === undefined)
		{
			return message.channel.send('', {
				embed: {
					title: 'An error occurred.',
					description: 'Please provide a message ID.',
					color: colors.error
				}
			});
		}

		channel.messages.fetch(messageId).then(found => {
			if (found.attachments.size >= 1)
			{
			const attachments = found.attachments.array();
			const attachmentFieldBody = [];
			found.attachments.tap(attachment => {
				attachmentFieldBody.push(attachment.url)
				})
				if (/\.(gif|jpg|jpeg|png)$/i.test(attachments[0].url))
				{
					return message.channel.send('', {
						embed: {
							author: {
								name: found.author.username,
								iconURL: found.author.avatarURL({size: 512, dynamic: true})
							},
							description: `${found.content}\n\n [Jump To Message](${found.url})`,
							color: found.member.displayColor || colors.base,
							thumbnail: {
								url: attachments[0].url 
							}, 
							footer: `#${found.channel.name}`,
							timestamp: found.createdAt
						}
					});
				}

				else 
				{
					message.channel.send('', {
						embed: {
							author: {
								name: found.author.username,
								iconURL: found.author.avatarURL({size: 512, dynamic: true})
							},
							description: `${found.content}\n\n [Jump To Message](${found.url})`,
							color: found.member.displayColor || colors.base,
							footer: `#${found.channel.name}`,
							timestamp: found.createdAt
						}
					});
					return message.channel.send('I can only embed gif, jpg, jpeg, & png attachments, you appear to have quoted an attachment outside of these categories.')
					.then(message => message.delete(5000))
				}
			}
			message.channel.send('', {
				embed: {
					author: {
						name: found.author.username,
						iconURL: found.author.avatarURL({size: 512, dynamic: true})
					},
					description: `${found.content}\n\n [Jump To Message](${found.url})`,
					color: found.member.displayColor || colors.base,
					footer: `#${found.channel.name}`,
					timestamp: found.createdAt
				}
			});
		}).catch(e => { return handleError(e) })

			function handleError(e) {
				if(!e)return;

				if (e.message == 'Missing Access')
					return message.channel.send('', {
						embed: {
							title: 'An error occurred.',
							description: 'Please make sure I can view the given channel.',
							color: colors.error
						}
					});

				message.channel.send('', {
					embed: {
						title: 'An error occurred.',
						description: 'Please make sure a valid message ID was entered.',
						color: colors.error
					}
				});
			}
    },
    aliases: ['q'],
	description: 'Quotes a message.',
	detailed: 'Quotes a message.',
	examples: prefix => `${prefix}quote <messageID> OR ${prefix}quote #channel <messageID>`,
	name: 'quote'
}
