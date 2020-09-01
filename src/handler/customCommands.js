const resolutions = [16, 32, 64, 128, 256, 512, 1024, 2048, 4096];
function replacer(snippet, member){
	return (()=>{
	switch (snippet){
		case 'id':
			return member.id;
		case 'nickname':
			return member.displayName;
		case 'tag':
			return member.user.tag;
		case 'username':
			return member.user.username
		default:
			if(snippet && snippet.startsWith('pfp')){
				let num = parseInt(snippet.replace(/\D/g, ''))||128;
				num = resolutions.includes(num) ? num : 128;
				return member.user.displayAvatarURL({
					format: 'png',
					dynamic: true,
					size: num
				})
			}
			return member.toString();
	}})().replace(/"/g, '\\"');
}

const authorPattern = /\((author)(\.(id|mention|nickname|tag|username|pfp\(.{0,4}\))){0,1}\)/gi;
const mentionsPattern = /\((mention)s{0,1}(\.(nth\(.*?\)|first|last|all)){0,1}(\.(id|mention|nickname|tag|username|pfp\(.{0,4}\))){0,1}\)/gi;

function parseCommand(command, message){
	return command.replace(authorPattern, match=>{
		let arr = match.replace(/^\(/, '').replace(/\)$/, '').split(/\./g);
		return replacer(arr[1], message.member);
	}).replace(mentionsPattern, match=>{
		if(!message.mentions)
			return undefined;
		let arr = match.replace(/^\(/, '').replace(/\)$/, '').split(/\./g);
		switch(arr[1]){
			case 'all':
				return message.mentions.members.reduce((acc, curr)=>acc + replacer(arr[2], curr) + ', ', ''). replace(/, $/, '');
			case 'first':
				return replacer(arr[2], message.mentions.members.first());
			case 'last':
				return replacer(arr[2], message.mentions.members.last());
			default:
				if(arr[1].startsWith('nth') || arr.length>2){
					return replacer(arr[2], message.mentions.members.array()[parseInt(arr[1].replace(/\D/g, ''))-1] || message.mentions.members.last());
				}
				else
					return replacer(arr[1], message.mentions.members.first());
		}
	})
}

const {mute} = require('../utils').mute;
const { convertTime } = require('../utils');

function takeAction(message, member, action, option){
	switch (action){
		case 'mute':
			let time = convertTime(option);
			if(isNaN(time))
				time = undefined;
			mute(message.guild, member, time, 'Custom command test', message.author, message.channel)
			.catch(e=>
				message.channel.send({embed:{
					title: 'Unable to mute user',
					description: e.message||e,
					color: colors.error
				}})
			);
			break;

		case 'toggleRole':
			if(member.roles.cache.get(option)){
				takeAction(message, member, 'removeRole', option);
				break;
			}
		case 'addRole':
			member.roles.add(option)
			.catch(e=>
				message.channel.send({embed:{
					title: 'Unable to remove role',
					description: 'Check bot permissions and hierarchical position.',
					color: colors.error
				}})
			);
			break;
		case 'removeRole':
			member.roles.remove(option)
			.catch(e=>
				message.channel.send({embed:{
					title: 'Unable to remove role',
					description: 'Check bot permissions and hierarchical position.',
					color: colors.error
				}})
			);
			break;
	}
}

const { isArray } = require('util');

const errorEmbed = {embed:{
	title: 'Custom command returned empty',
	description: `Please see [custom command documentation](${require('../../package.json').repository.url.replace('git+', '').replace('.git', '')}/blob/master/docs/custom_commands.md) or refer server admins there.`
}};

function runCustomCommand(customCommand, message){
	console.log(customCommand)
	let command = parseCommand(customCommand, message);
	command = JSON.parse(command);
	if(command.actions){
		if(!isArray(command.actions))
			command.actions = JSON.parse(command.actions);

		if(isArray(command.actions)&&command.actions[0])
			command.actions.forEach(action =>{
				const arr = action.target.split('.');
				if(arr[0]=='author')
					takeAction(message, message.member, action.action, action.option)
				else
					switch(arr[1]){
						case 'all':
							message.mentions.members.each(member=>takeAction(message, member, action.action, action.option));
							break;
						case 'first':
							takeAction(message, message.mentions.members.first(), action.action, action.option);
							break;
						case 'last':
							takeAction(message, member, message.mentions.members.last(), action.action, action.option);
							break;
						default:
							if(arr[1].startsWith('nth'))
								takeAction(message, message.mentions.members.array()[parseInt(arr[1].replace(/\D/g, ''))-1] || message.mentions.members.last(), action.action, action.option)
							else
								takeAction(message, message.mentions.members.first(), action.action, action.option);
					}
			});
	}
	let msg = {};
	if(Object.keys(command.embed).length)
		msg.embed = command.embed;
	if(command.image)
		msg.files = [command.image];
	if(msg.embed||(msg.files&&msg.files[0]))
		message.channel.send(command.message, msg);
	else if(command.message)
		message.channel.send(command.message);
	else
		message.channel.send(errorEmbed);
}



module.exports = runCustomCommand;