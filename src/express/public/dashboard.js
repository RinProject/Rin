const logProperties = [{title:'Message log status',content:[{title:'Message change',content:['channelPinsUpdate','messageDelete','messageDeleteBulk','messageUpdate']},{title:'Message reactions',content:['messageReactionAdd','messageReactionRemove','messageReactionRemoveAll','messageReactionRemoveEmoji']},{title:'Miscellaneous message',content:['inviteCreate','inviteDelete']}]},{title:'Server log status',content:[{title:'Channel',content:['channelCreate','channelDelete','channelUpdate','webhookUpdate']},{title:'Emoji',content:['emojiCreate','emojiDelete','emojiUpdate']},{title:'Role',content:['roleCreate','roleDelete','roleUpdate']},{title:'Guild',content:['guildUpdate','guildIntegrationsUpdate']}]},{title:'Moderation log status',content:[{title:'Bans',content:['guildBanAdd','guildBanRemove']},{title:'Join/leave',content:['guildMemberAdd','guildMemberRemove']},{title:'Member change',content:['guildMemberUpdate','userUpdate']}]}];

const options = {weekday:'short',year:'numeric',month:'short',day:'numeric',hour:'numeric',minute:'numeric',second:'numeric',timeZoneName:'short'};
const formatter = new Intl.DateTimeFormat('en-GB', options);

function notification(message){
	let notification = document.createElement('div');
	notification.classList.add('notification');
	notification.innerHTML = `<p>${message}</p>`;
	document.body.appendChild(notification);
	setTimeout(()=>{
		notification.remove();
	}, 4000);
}

function generateLogs(settings){
	let parent = document.getElementById('content');
	if(!settings)
		return parent.innerHTML = '<h1>No logging set up, see <a href="/commands/#log">log command</a></h1>';
	parent.innerHTML='';
	logProperties.forEach(category => {
		let div = document.createElement('div');
		let title = document.createElement('h1');
		title.innerText=category.title;
		div.appendChild(title);

		category.content.forEach(subcategory=>{
			let subcategoryDiv = document.createElement('div');
			let title = document.createElement('h2');
			title.innerText=subcategory.title;
			subcategoryDiv.appendChild(title);

			subcategory.content.forEach(property=>{
				let checkbox = document.createElement('input');
				checkbox.setAttribute('type', 'checkbox');
				checkbox.checked=Boolean(settings[property]);
				checkbox.id = property;
				subcategoryDiv.appendChild(checkbox);

				let prop = document.createElement('span');
				prop.innerText=property;
				subcategoryDiv.appendChild(prop);
				subcategoryDiv.appendChild(document.createElement('br'));
			});

			div.appendChild(subcategoryDiv);
		});
		parent.appendChild(div);
	});
	let save = document.createElement('button');
	save.innerText = 'save';
	save.onclick = logsSave;
	parent.appendChild(save);
}

function logsSave(){
	let newSettings = {};
	for(setting in settings)
		if(document.getElementById(setting))
			newSettings[setting] = document.getElementById(setting).checked;
	fetch(base+'save/logs',{
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(newSettings)
	}).then(res=>res.ok?notification('Settings saved'):notification(res.status+' '+res.statusText))
	.catch(console.log);
}

function createWarning(warning){
	let div = document.createElement('div');
	div.classList.add('warning');
	if(!warning.active)
		div.classList.add('inactive');
	div.innerHTML = 
	`<h3>Reason${warning.active?'':' (redacted)'}</h3><p>${warning.reason}</p><h3>Moderator</h3><p>Name: ${warning.moderator.name}</p><p>ID: ${warning.moderator.id}</p><h3>User</h3><p>Name: ${warning.user.name}</p><p>ID: ${warning.user.id}</p><h3>Warning id</h3><p>${warning.id}</p><h3>Timestamp</h3><p>${formatter.format(warning.time)}</p>`;
	return div;
}

function generateWarnings(warnings){
	document.getElementById('content').innerHTML='';
	if(warnings[0])
		warnings.forEach((warning)=>{
			content.appendChild(createWarning(warning));
		});
	else
		content.innerHTML='<h2>No warnings have been issued, to issue a warning see <a href="/commands/#warn">this.</a></h2>'
}

function generateSettings(settings){
	let div = document.getElementById('content');
	div.innerHTML = `<label for="prefix">Prefix</label><input style="width: 4rem;margin-right:0.3rem;" type="text" name="prefix" id="prefix" value="${settings.prefix}"><button onclick="setPrefix()">save</button><br /><h1>Disabled commands</h1><p style="opacity: .5;">Commands can currently only be disabled in client, see <a href="/commands/#togglecommand">toggleCommand</a></p>`
	+ settings.disabled.reduce((acc, command)=>{return acc + `<div class="warning"><h3>${command}</h3></div>`}, '') || '<div class="warning"><h3>none</h3></div>';
}

function setPrefix(){
	fetch(base+'save/prefix',{
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({prefix: document.getElementById('prefix').value})
	}).then(res=>res.ok?notification('Prefix saved'):notification(res.status+' '+res.statusText))
	.catch(console.log);
}
async function embedSenderBuilder(info){
	let div = document.getElementById('content');
	div.innerHTML = `<label>Channel</label><select id="channel">${info.channels.reduce((acc, curr)=>acc+`<option value="${curr.id}">${curr.name}</option>`, '')}</select><br>`
	let embed = await embedBuilderBuilder(div);
	embed.children[text.indexOf('Author')] = info.user.tag;
	embed.children[text.indexOf('Author Icon')] = info.user.pfp;
	div.innerHTML += '<br><button onclick="sendEmbed()">Send</button>';
}
const text = [
	'Author',
	'Author URL',
	'Author Icon',
	'Thumbnail',
	'Message Title',
	'Colour',
	'Description',
	'Image',
	'Footer',
	'Footer Icon'
]
async function embedBuilderBuilder(parent){
	let builder = document.createElement('div');
	builder.classList.add('embedBuilder')
	let html = '';
	text.forEach(field => {
		let id=field.toLowerCase().replace(/\s+/g, '_');
		html+=`<input type="text" name="${id}" class="${id}" placeholder="${field}">`;
	});
	builder.innerHTML += html+`<div class="fields"></div><button class="add_field" onclick="addField(this.parentElement)">Add field</button>`
	let textarea = document.createElement('textarea');
	textarea.classList.add('description');
	textarea.placeholder = 'Description';
	parent.appendChild(builder);
	builder.replaceChild(textarea, builder.children[6]);
	return builder;
}

function addField(parent, data){
	let fields = parent.children[parent.children.length-2];
	if(fields.children.length>24)
		return notification('No more fields can be created');
	let field = document.createElement('div');
	field.innerHTML = `<input type="text" placeholder="Title"${data&&(data.name||data.title)?` value=${data.name||data.title}`:''}><div><label>Short</label><input type="checkbox" checked="${Boolean(data&&(data.short||data.inline))}"></div><button onclick="this.parentElement.remove()">x</button><textarea placeholder="Content">${data?data.name||data.title||'':''}</textarea>`;
	fields.appendChild(field);
}

function fetchEmbed(embed){
	let message = {};
	text.forEach((field, i) => {
		let id=field.toLowerCase().replace(/\s+/g, '_');
		if(embed.children[i].value)
			message[id] = embed.children[i].value;
	});
	let fields = []
	let f = embed.children[text.length];
	for (let i = 0; i < f.children.length; i++) {
		const field = f.children[i].children;
		if(field[0]||field[3])
			fields.push({
				name: field[0].value,
				value: field[3].value,
				inline: field[1].children[1].checked
			});
	}
	if(fields[0])message.fields = fields;
	return message;
}

function sendEmbed(){
	let message = fetchEmbed(document.querySelector('.embedBuilder'));
	message.channel = document.getElementById('channel').value;
	fetch(base+'send/embed',{
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(message)
	}).then(res=>res.ok?notification('Message sent'):notification(res.status+' '+res.statusText))
	.catch(console.log);
}

async function generateCustomCommandBuilder(command, parent){
	let div = document.createElement('div');
	const save = () => {
		let save = document.createElement('button');
		save.innerText = 'Save';
		save.onclick = ()=>{saveCommand(guiToObject(embed, mentions, permissions))};
		return save;
	};
	div.classList.add('commandBuilder');
	div.innerHTML += `<input type="text" name="name" id="name" placeholder="name"${command.name?` value=${command.name}`:''}>`
	+`<textarea id="message" placeholder="Message">${command.message||''}</textarea>`
	+`<input type="text" name="image" id="image" placeholder="Image link"${command.image?` value=${command.image}`:''}>`
	+`<textarea id="perms" placeholder="Permissions">${command.permissions&&command.permissions[0]?command.permissions.join('\n'):''}</textarea>`
	+`<textarea id="actions" placeholder="Actions">${command.actions&&command.actions[0]?command.actions.reduce((acc, curr)=>curr.action&&curr.target&&curr.option?`${acc}\n${curr.action}(${curr.target}, ${curr.option})`:'', ''):''}</textarea>`
	+`<label for="number">Required number of mentions</label>`
	+`<input min="0" max="20" type="number" name="requires" id="requires"${command.requires&&command.requires.mentions?` value=${command.requires.mentions}`:''}><label>Embed</label>`;
	
	let embed = await embedBuilderBuilder(div);

	div.appendChild(l('Insufficient permissions', 'perms'));
	let permissions = await embedBuilderBuilder(div);
	permissions.classList.add('perms');
	div.appendChild(t('Insufficient permissions actions', 'perms', 'permissionsActions', 
		(command.insufficientPermissions&&command.insufficientPermissions.actions&&command.insufficientPermissions.actions[0]?
			command.insufficientPermissions.actions.reduce((acc, curr)=>
				curr.action&&curr.target&&curr.option?
					`${acc}${curr.action}(${curr.target}, ${curr.option})\n`:
					'', '')
				:'')
		));

	div.appendChild(l('Insufficient mentions', 'mentions'));
	let mentions = await embedBuilderBuilder(div);
	mentions.classList.add('mentions');
	div.appendChild(t('Insufficient mentions actions', 'mentions', 'mentionsActions', 
		(command.insufficientMentions&&command.insufficientMentions.actions&&command.insufficientMentions.actions[0]?
			command.insufficientMentions.actions.reduce((acc, curr)=>
				curr.action&&curr.target&&curr.option?
					`${acc}\n${curr.action}(${curr.target}, ${curr.option})`:
					'', '')
				:'')
		));
	parent.appendChild(div);

	let requires = document.getElementById('requires');
	requires.addEventListener('change', ()=>requires.value > 0 ? div.classList.add('requires') : div.classList.remove('requires'));
	if(requires.value)div.classList.add('requires');

	let perms = document.getElementById('perms');
	perms.addEventListener('keyup', ()=>perms.value ? div.classList.add('perms') : div.classList.remove('perms'));
	if(perms.value)div.classList.add('perms');

	if(command&&command.embed){insertIntoEmbed(embed, command.embed);}
	if(command.insufficientPermissions){insertIntoEmbed(permissions, command.insufficientPermissions);}
	if(command.insufficientMentions){insertIntoEmbed(mentions, command.insufficientMentions);}
	div.insertBefore(document.createElement('br'), div.firstChild);
	div.insertBefore(save(), div.firstChild);
	div.appendChild(document.createElement('br'));
	div.appendChild(save());
	return {embed, mentions, permissions};
}
const l=(s,c)=>{let e=document.createElement('label');e.innerText=s;e.classList.add(c);return e;};

const t=(p,c,id,v)=>{
	let e=document.createElement('textarea');
	e.placeholder=p;
	e.classList.add(c);
	e.id=id;
	e.value=v;
	return e;
};

function insertIntoEmbed(embed, command){
	text.forEach((field, i) => {
		let id=field.toLowerCase().replace(/\s+/g, '_');
		embed.children[i].value = command[id] || '';
	});
	if(command.author){
		if(command.author.name)
			embed.children[text.findIndex('Author')].value = command.author.name;
		if(command.author.url)
			embed.children[text.findIndex('Author URL')].value = command.author.url;
		if(command.author.iconURL)
			embed.children[text.findIndex('Author Icon')].value = command.author.iconURL;
	}
	if(command.footer){
		if(command.footer.text)
			embed.children[text.findIndex('Footer')].value = command.footer.text;
		if(command.footer.iconURL)
			embed.children[text.findIndex('Footer Icon')].value = command.footer.iconURL;
	}
	if(command.thumbnail&&command.thumbnail.url) embed.children[text.findIndex('Thumbnail')].value = command.thumbnail.url;
	if(command.image&&command.image.url) embed.children[text.findIndex('Image')].value = command.image.url;
	if(command.title) embed.children[text.findIndex('Message Title')].value = command.title;
	if(command.fields&&command.fields[0]) command.fields.forEach(field=>addField(embed, field));
}

function actionsHelper(id){
	let a = document.getElementById(id).value.split('\n');
	a.forEach((v, i)=>{let A = v.replace(/\)$|\s/g, '').split(/[\(,]/g);a[i]={action:A[0],target:A[1],option:A[2]};});
	return a;
}

function guiToObject(){
	let embed = document.querySelector('.embedBuilder');
	let mentions = document.querySelector('.embedBuilder.mentions');
	let perms = document.querySelector('.embedBuilder.perms');
	let m = window.getComputedStyle(mentions).getPropertyValue('display')!=='none'?fetchEmbed(mentions):null;
	if(m)
		m.actions = actionsHelper('mentionsActions');
	let p = window.getComputedStyle(perms).getPropertyValue('display')!=='none'?fetchEmbed(perms):null;
	if(p)
		p.actions = actionsHelper('permissionsActions');
	console.log(p)
	return {
		name: document.getElementById('name').value.toLowerCase(),
		message: document.getElementById('message').value,
		image: document.getElementById('image').value,
		permissions: document.getElementById('perms').value.replace(/[^a-z_\n]/gi, '').split('\n'),
		requires: {mentions: parseInt(document.getElementById('requires').value)},
		actions: (()=>{
			let a = document.getElementById('actions').value.split('\n');
			a.forEach((v, i)=>{let A = v.replace(/\)$|\s/g, '').split(/[\(,]/g);a[i]={action:A[0],target:A[1],option:A[2]};});
			return a;
		})(),
		embed: fetchEmbed(embed),
		insufficientMentions: m,
		insufficientPermissions: p
	};
}

function saveCommand(command){
	fetch(base+'save/command',{
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(command)
	}).then(res=>res.ok?notification('Command saved'):notification(res.status+' '+res.statusText))
	.catch(console.log);
}

function JSONCommands(commands, command){
	if(document.url!=`${base}json/`)
		window.history.pushState({"pageTitle":document.getElementById('title').innerText},"", `${base}json/`)
	content.innerHTML = '<h3>Custom Command <a href="/docs/">docs found here</a></h3>';
	if(commands&&commands[0])
		content.innerHTML += `<label>Command</label><select id="command">${commands.reduce((acc, curr, i)=>acc+`<option value="${curr.name}">${curr.name}</option>`, '')}</select><button id="load">Load</button><button id="delCmd">Delete command</button>`;
	content.innerHTML += '<button id="reload">Reload commands</button><button id="gui">GUI editor</button><button id="save">save</button><br><br>'
	content.innerHTML += `<textarea id="commandEditor"></textarea>`;
	document.getElementById('commandEditor').value = JSON.stringify(command, null, '\t')||'';
	document.getElementById('reload').onclick = ()=>{load('json');};
	document.getElementById('save').onclick = ()=>{
		try {saveCommand(JSON.parse(document.getElementById('commandEditor').value));}
		catch(e){console.log(e),notification('Command not valid JSON');}
	};
	document.getElementById('gui').onclick = ()=>{
		let c;
		try {
			c = JSON.parse(document.getElementById('commandEditor').value)	
		}catch(e){}
		
		customCommands(commands, c);
	};
	document.getElementById('commandEditor').addEventListener('keydown', (event)=>{
		if(event.key=='Tab'){
			event.preventDefault();
			document.execCommand('insertText', false, '\t');
		}
	});
	if(commands&&commands[0]){
		document.getElementById('delCmd').onclick = ()=>{
			fetch(base+'delete/command',{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({name: document.getElementById('command').value})
			}).then(res=>res.ok?notification('Command deleted'):notification(res.status+' '+res.statusText))
			.catch(console.log);
		};
		document.getElementById('load').onclick = ()=>{
			const name = document.getElementById('command').value;
			document.getElementById('commandEditor').value = JSON.stringify(commands.find((command)=>command.name == name), null, '\t')||'';
		};
	}
}

async function customCommands(commands, command){
	if(document.url!=`${base}custom/`)
		window.history.pushState({"pageTitle":document.getElementById('title').innerText},"", `${base}custom/`)
	content.innerHTML = '<h3>Custom Command <a href="/docs/">docs found here</a></h3>';
	if(commands&&commands[0])
		content.innerHTML += `<label>Command</label><select id="command">${commands.reduce((acc, curr, i)=>acc+`<option value="${curr.name}">${curr.name}</option>`, '')}</select><button id="load">Load</button><button id="delCmd">Delete command</button>`;
	content.innerHTML += '<button id="json">JSON editor</button><button id="reload">Reload commands</button><br><br>'
	await generateCustomCommandBuilder(command||{}, content);
	document.getElementById('json').onclick = ()=>{
		JSONCommands(commands, guiToObject())
	};
	document.getElementById('reload').onclick = ()=>{
		load('custom');
	};
	if(commands&&commands[0]){
		document.getElementById('delCmd').onclick = ()=>{
			fetch(base+'delete/command',{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({name: document.getElementById('command').value})
			}).then(res=>res.ok?notification('Command deleted'):notification(res.status+' '+res.statusText))
			.catch(console.log);
		};
		document.getElementById('load').onclick = ()=>{
			document.querySelector('.commandBuilder').remove();
			const name = document.getElementById('command').value;
			generateCustomCommandBuilder(commands.find((command)=>command.name == name), content)
		};
	}
}

let settings;
let content = document.getElementById('content');
async function load(path){
	let title = '';
	switch (path||document.URL.split(/\/+/g)[4]){
		case 'logs':
			await fetch(base+'get/logs')
			.then(response => response.json())
			.then(data => {
				title = 'Log settings for '+data.name;
				settings = data.settings;
				generateLogs(settings);
			})
			.catch(content.innerHTML='<h1>Please set up logs using the <a href="/commands/#log">log command</a></h1>');
			break;
		case 'warnings':
			await fetch(base+'get/warnings')
			.then(response => response.json())
			.then(data => {
				title = 'Warnings in '+data.name;
				generateWarnings(data.warnings);
			})
			.catch(console.error);
			break;
		case 'embed':
			await fetch(base+'get/embed')
			.then(response => response.json())
			.then(data => {
				title = 'Embed builder for '+data.name;
				embedSenderBuilder(data.data);
			})
			.catch(console.error);
			break;
		case 'custom':
			await fetch(base+'get/commands')
			.then(response => response.json())
			.then(data => {
				title = 'Custom commands '+data.name;
				customCommands(data.commands);
			})
			.catch(console.error);
			break;
		case 'json':
			await fetch(base+'get/commands')
			.then(response => response.json())
			.then(data => {
				title = 'Custom commands '+data.name;
				JSONCommands(data.commands);
			})
			.catch(console.error);
			break;
		case 'settings': default:
			await fetch(base+'get/settings')
			.then(response => response.json())
			.then(data => {
				title = 'Settings for '+data.name;
				generateSettings(data.settings);
			})
			.catch(console.error);
			break;
	}
	if(!title)
		throw 403;
	document.getElementById('title').innerText = title;
	document.title=title;
}

function pageShift(e, path){
    e = e || window.event;
	e.preventDefault();
	(async ()=>{
		if(`${base}${path}/` == document.URL)return;
		await load(path)
		.then(()=>window.history.pushState({"pageTitle":document.getElementById('title').innerText},"", `${base}${path}/`))
		.catch(()=>{notification('Cannot access that page.')});
	})();
}

const base = document.URL.replace(/\/\D+\/{0,1}$/, '/')

load();