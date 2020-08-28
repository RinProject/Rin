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
	await embedBuilderBuilder(info, div);
	div.innerHTML += '<br><button onclick="sendEmbed()">Send</button>';
	document.getElementById('author').value = info.user.tag;
	document.getElementById('author_icon').value = info.user.pfp;
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
async function embedBuilderBuilder(info, parent){
	let html = ''
	html += '<div class="embedBuilder">';
	text.forEach(field => {
		let id=field.toLowerCase().replace(/\s+/g, '_');
		html+=`<input type="text" name="${id}" id="${id}" placeholder="${field}">`;
	});
	parent.innerHTML += html+`<div id="fields"></div><button id="add_field" onclick="addField()">Add field</button></div>`
	let textarea = document.createElement('textarea');
	textarea.id = 'description';
	textarea.placeholder = 'Description';
	document.querySelector('.embedBuilder').replaceChild(textarea, document.getElementById('description'));
}

function addField(){
	let fields = document.getElementById('fields')
	if(fields.children.length>24)
		return notification('No more fields can be created');
	let field = document.createElement('div');
	field.innerHTML = '<input type="text" placeholder="Title"><div><label>Short</label><input type="checkbox"></div><textarea placeholder="Content"></textarea>'
	fields.appendChild(field);
}

function fetchEmbed(parent){
	let message = {fields: []};
	text.forEach((field, i) => {
		let id=field.toLowerCase().replace(/\s+/g, '_');
		message[id] = parent.children[i].value;
	});
	let fields = parent.children[text.length];
	for (let i = 0; i < fields.children.length; i++) {
		const field = fields.children[i].children;
		message.fields.push([
			field[0].value,
			field[2].value,
			field[1].children[1].checked
		]);
	}
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
		await load(path)
		.then(()=>window.history.pushState({"pageTitle":document.getElementById('title').innerText},"", `${base}${path}/`))
		.catch(()=>{notification('Cannot access that page.')});
	})();
}

const base = document.URL.replace(/\/\D+\/{0,1}$/, '/')

load();