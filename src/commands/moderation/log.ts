import { Guild, LogEvent } from '../../database';
import { Command, eventKeyName } from '../../core';

const events = Object.keys(eventKeyName);
const eventList = `Event list:
\`\`\`
${events.reduce((a, v) => `${a}• ${eventKeyName[v]}\n`, '').slice(0, -1)}
\`\`\``;
const detailed = `Lets you set and modify: your log channel and what you log to your hearts content.

${eventList}`;

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
							description: `Correct usage:\n\`\`\`${message.client.prefix()}log enable all\n${message.client.prefix()}log enable [event]\`\`\`\n\n${eventList}`,
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
						g.disableLoggingFor(event as LogEvent);
						g.save();
						message.channel.send({
							embed: {
								title: 'Event enabled',
								description: `This bot will log \`${eventKeyName[event]}\` events.`,
								color: colors.success,
							},
						});
					} else
						message.channel.send({
							embed: {
								title: 'Unable to find an event that can be logged by that name',
								description: eventList,
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
							description: `Correct usage:\n\`\`\`${message.client.prefix()}log disable all\n${message.client.prefix()}log disable [event]\`\`\`\n\n${eventList}`,
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
						g.disableLoggingFor(event as LogEvent);
						g.save();
						message.channel.send({
							embed: {
								title: 'Event disabled',
								description: `This bot will not log \`${eventKeyName[event]}\` events.`,
								color: colors.success,
							},
						});
					} else
						message.channel.send({
							embed: {
								title: 'Unable to find an event that can be logged by that name',
								description: eventList,
								color: colors.error,
							},
						});
				}
				break;
			}
			default: {
				const g = await Guild.findOne({ id: message.guild.id });
				const status =
					`Log channel: ${g.logChannel ? `<#${g.logChannel}>` : 'none'}\n\`\`\`` +
					events
						.reduce(
							(acc, v) => `${acc}${g.eventLogged(v as LogEvent) ? '✓' : '✕'} ${eventKeyName[v]}\n`,
							''
						)
						.slice(0, -1) +
					'```';
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
	detailed,
	examples: [
		(prefix) => `${prefix}log channel #logs`,
		(prefix) => `${prefix}log enable all`,
		(prefix) => `${prefix}log disable all`,
		(prefix) => `${prefix}log enable mute`,
		(prefix) => `${prefix}log disable guildMemberAdd`,
	],
	name: 'Log',
	permissions: ['ADMINISTRATOR'],
	guildOnly: true,
});
