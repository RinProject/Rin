import { Guild } from '../../database';
import { Command, eventKeyName } from '../../core';

const events = Object.keys(eventKeyName);

const eventsText = `Event list:
\`\`\`
${events.reduce((a, v) => `${a}${eventKeyName[v]}\n`, '').slice(0, -1)}
\`\`\``;

export = new Command({
	run: async function (message, args, colors) {
		switch (args[1] ? args[1].toLowerCase() : '') {
			case 'channel': {
				if (!message.mentions.channels.first()) {
					message.channel.send({
						embed: {
							title: 'Incorrect command usage',
							description: `${message.client.prefix()}log channel #logChannel`,
							color: colors.error,
						},
					});
					return;
				}
				const g = await Guild.findOne({ id: message.guild.id });
				g.logChannel = message.mentions.channels.first().id;
				g.save();
				message.channel.send({
					embed: {
						title: 'Log channel set',
						description: `Log channel is now ${message.mentions.channels.first().toString()}`,
						color: colors.success,
					},
				});
				break;
			}
			case 'enable': {
				if (!args[2])
					message.channel.send({
						embed: {
							title: 'Incorrect command usage',
							description: `Correct usage:\n\`\`\`${message.client.prefix()}log enable all\n${message.client.prefix()}log enable [event]\`\`\`\n\n${eventsText}`,
						},
					});
				else if (args[2] == 'all') {
					const g = await Guild.findOne({ id: message.guild.id });
					g.logAll();
					g.save();
					message.channel.send({
						embed: {
							title: 'All events will now be logged',
							description: g.logChannel
								? `All events will now be logged to <#${g.logChannel}>.`
								: `Please select a channel for them to be logged to by typing running the ${message.client.prefix()}log channel #logChannel`,
							color: colors.success,
						},
					});
					break;
				} else {
					const event = args[2].toLowerCase();
					if (events.includes(event)) {
						const g = await Guild.findOne({ id: message.guild.id });
						g.disableLoggingFor(event);
						g.save();
						message.channel.send({
							embed: {
								title: 'Event now logged',
								description: `Now logging ${eventKeyName[event]}`,
								color: colors.success,
							},
						});
					} else
						message.channel.send({
							embed: {
								title: 'Unable to find an event that can be logged by that name',
								description: eventsText,
								color: colors.error,
							},
						});
				}
				break;
			}
			case 'disable': {
				if (!args[2])
					message.channel.send({
						embed: {
							title: 'Incorrect command usage',
							description: `Correct usage:\n\`\`\`${message.client.prefix()}log disable all\n${message.client.prefix()}log disable [event]\`\`\`\n\n${eventsText}`,
						},
					});
				else if (args[2] == 'all') {
					const g = await Guild.findOne({ id: message.guild.id });
					g.logNone();
					g.save();
					message.channel.send({
						embed: {
							title: 'All logs disabled',
							description: 'No events will be logged from here on out unless logging is enabled.',
							color: colors.success,
						},
					});
					break;
				} else {
					const event = args[2].toLowerCase();
					if (events.includes(event)) {
						const g = await Guild.findOne({ id: message.guild.id });
						g.disableLoggingFor(event);
						g.save();
						message.channel.send({
							embed: {
								title: 'Event not logged',
								description: `No longer logging ${eventKeyName[event]}`,
								color: colors.success,
							},
						});
					} else
						message.channel.send({
							embed: {
								title: 'Unable to find an event that can be logged by that name',
								description: eventsText,
								color: colors.error,
							},
						});
				}
				break;
			}
			default: {
				const g = await Guild.findOne({ id: message.guild.id });
				const status =
					`Log channel: ${g.logChannel ? `<#${g.logChannel}>` : 'none'}\n\n` +
					events
						.reduce(
							(acc, v) =>
								`${acc}${eventKeyName[v]} ${g.eventLogged(v) ? ':white_check_mark:' : ':x:'}\n`,
							''
						)
						.slice(0, -1);
				message.channel.send({
					embed: {
						title: 'Log status',
						description: status,
						color: colors.base,
					},
				});
			}
		}
	},
	description: 'Sets, clears, and displays your log settings.',
	detailed: 'Lets you set and modify: your log channel and what you log to your hearts content.',
	examples: [(prefix) => `${prefix}log channel #logs`, (prefix) => `${prefix}log enable all`],
	name: 'log',
	permissions: ['ADMINISTRATOR'],
	guildOnly: true,
});
