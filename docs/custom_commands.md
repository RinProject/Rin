### Table of Contents 
- [Custom commands](#custom-commands)
	- [Creating a command using the dashboard](#creating-a-command-using-the-dashboard)
		- [Command creation](#command-creation)
			- [Example output](#example-output)
		- [Actions](#actions)
		- [Conditions](#conditions)
			- [Permissions](#permissions)
			- [Mentions](#mentions)
			- [If conditions aren't met](#if-conditions-arent-met)
	- [Creating a command using JSON](#creating-a-command-using-json)
		- [Actions](#actions-1)
		- [Conditions](#conditions-1)
			- [Permissions](#permissions-1)
			- [Mentions](#mentions-1)
			- [If conditions aren't met](#if-conditions-arent-met-1)
		- [Equivalent JSON snippets](#equivalent-json-snippets)
			- [Author](#author)
			- [thumbnail](#thumbnail)
			- [image](#image)
			- [message_title](#message_title)
			- [footer](#footer)
			- [Fields](#fields)
- [Command snippets](#command-snippets)
	- [author](#author-1)
	- [mention](#mention)
	- [mentions](#mentions-2)
		- [.all](#all)
		- [.first](#first)
		- [.last](#last)
		- [.nth()](#nth)
	- [user](#user)
		- [.id](#id)
		- [.mention](#mention-1)
		- [.nickname](#nickname)
		- [.pfp()](#pfp)
		- [.tag](#tag)
		- [.username](#username)
	- [Actions](#actions-2)
		- [mute()](#mute)
		- [giveRole()](#giverole)
		- [removeRole()](#removerole)
		- [toggleRole()](#togglerole)

# Custom commands

## Creating a command using the dashboard
If you prefer creating a command using a code/text editor go to the [relevant section below](#creating-a-command-using-json). All [command snippets](#command-snippets) such as `(author.tag)` are valid anywhere in any text field. However `(.mentions)` will only work properly in message content, embed description and the description of a field. Using anything other than a users image in an image/link field is not recommended but is fully possible.

### Command creation
Commands are created the same way you would send an embed from the dashboard with a few more options. 

#### Example output
Content
```c
(author.mention) cuddled (mentions.first.mention)
```
Example response
```c
@Tarren#9722 cuddled @Jihyo#2423
```

### Actions
Actions are written row by row, see example below
```js
giveRole(author, 724239960894472192)
giveRole(mentions.first, 724239960894472192)
```

### Conditions

#### Permissions
Permissions are written row by row, see example below. 
```
MANAGE_MEMBERS
MANAGE_ROLES
```
*Note: Discord has a [list of permissions](https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags) on their dev site*

#### Mentions
There is an adjustment mechanism for number of required mentions for a command to run.

#### If conditions aren't met
If conditions aren't met actions and reply embeds can be set based on why the failure occurred. These will show up below the regular embed if conditions are enabled, they have the same available actions as a normal command, if a condition fails without any conditions set up a generic message wil be displayed.

## Creating a command using JSON
If you prefer creating a command using a GUI go to the [relevant section above](#creating-a-command-using-the-dashboard). All [command snippets](#command-snippets) such as `(author.tag)` are valid anywhere in the JSON, except `field.short` which only accepts boolean `true` or `false`. However `(.mentions)` will only work properly in `message`, `embed.description` and the `description` of a field. Using anything other than a users image in an image/link field is not recommended but is fully possible.

Example JSON featuring most features
```JSON
{
	"name": "Example",
	"message": "Plain text outside embed",
	"image": "https://example.com/image.png",
	"permissions": [
		"SEND_MESSAGES",
		"MANAGE_MESSAGES"
	],
	"requires":{
		"mentions": 2
	},
	"embed": {
		"author": "Sender",
		"author_url": "https://example.com/",
		"author_icon": "https://example.com/pfp.png",
		"thumbnail": "https://example.com/thumbnail.png",
		"message_title": "Title",
		"colour": "#00CCFF",
		"description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
		"image": "https://example.com/image.png",
		"footer": "Footer",
		"footer_icon": "https://example.com/icon.png",
		"fields": [
			{
				"title": "Field title",
				"description": "Field content",
				"short": false
			},
			{
				"title": "Foo bar",
				"description": "Placeholder content",
				"short": false
			}
		]
	},
	"insufficientMentions": {
		"message_title": "Insufficient mentions",
		"description": "You must mention at least two users to use this command",
		"colour": "#ff0000",
		"actions": []
	},
	"insufficientPermissions": {
		"message_title": "Insufficient permissions",
		"description": "You may not use this command",
		"colour": "#ff0000",
		"actions": [
			{
				"action":"mute",
				"target": "author",
				"option": "1m"
			}
		]
	},
	"actions": [
		{
			"action":"mute",
			"target": "mentions.all",
			"option": "5m"
		}
	]
}
```

### Actions
Actions are written as an array of object with the target user(s) as `target` property and any options such as which role or how long a mute shall last are in the `option` property.
```JSON
{
	"actions": [
		{
			"action":"mute",
			"target": "author",
			"option": "1d"
		},
		{
			"action":"giveRole",
			"target": "mentions.first",
			"option": "724239960894472192"
		}
	]
}
```

### Conditions

#### Permissions
Permissions are written as an array of strings and if set are required for the command to be used, see example below. 
```json
{
	"permissions": [
		"MANAGE_MEMBERS"
		"MANAGE_ROLES"
	]
}
```
*Note: Discord has a [list of permissions](https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags) on their dev site*

#### Mentions
A minimum number of mentions can be added to a command, see example below. 
```json
{
	"requires": {
		"mentions": 1
	}
}
```

#### If conditions aren't met
If the conditions for a command to be run aren't met you may provide a response, if none is entered a generic message will be displayed on failure of conditions to be met. In the example below is a simple command that will mute all mentioned users, however if no users are mentioned the command will return a error, and if permissions are lacking the user will mute themselves instead.
```json
{
	"name": "slap",
	"permissions": [
		"MANAGE_ROLES"
	],
	"requires": {
		"mentions": 1
	},
	"embed": {
		"description": "(author.tag) slapped (mentions.all.tag)!"
	},
	"actions": [
		{
			"action": "mute",
			"target": "mentions.all",
			"option": "5m"
		}
	],
	"insufficientMentions": {
		"description": "(author.tag) slapped the air...",
		"colour": "#ff0000",
		"actions": []
	},
	"insufficientPermissions": {
		"description": "(author.tag) tried to use slap but muted themselves instead!",
		"colour": "#ff0000",
		"actions": [
			{
				"action": "mute",
				"target": "author",
				"option": "1m"
			}
		]
	}
}
```

### Equivalent JSON snippets

#### Author
Two equivalent commands
```JSON
{
	"embed": {
		"author": "Sender",
		"author_url": "https://example.com/",
		"author_icon": "https://example.com/pfp.png",
		"message_title": "Author snippet"
	}
}
```
```JSON
{
	"embed": {
		"author": {
			"name": "Sender",
			"url": "https://example.com/",
			"iconURL": "https://example.com/pfp.png",
		},
		"message_title": "Author snippet"
	}
}
```

#### thumbnail
Two equivalent commands
```JSON
{
	"embed": {
		"message_title": "Author snippet",
		"thumbnail": "https://example.com/thumbnail.png"
	}
}
```
```JSON
{
	"embed": {
		"message_title": "Author snippet",
		"thumbnail": {
			"url": "https://example.com/thumbnail.png"
		}
	}
}
```

#### image
Two equivalent commands
```JSON
{
	"embed": {
		"message_title": "Author snippet",
		"image": "https://example.com/thumbnail.png"
	}
}
```
```JSON
{
	"embed": {
		"message_title": "Author snippet",
		"image": {
			"url": "https://example.com/thumbnail.png"
		}
	}
}
```

#### message_title
Two equivalent commands
```JSON
{
	"embed": {
		"message_title": "title"
	}
}
```
```JSON
{
	"embed": {
		"title": "title"
	}
}
```

#### footer
Two equivalent commands
```JSON
{
	"embed": {
		"message_title": "Footer snippet",
		"footer": "Footer text",
		"footer_icon": "https://example.com/icon.png",
	}
}
```
```JSON
{
	"embed": {
		"message_title": "Footer snippet",
		"footer": {
			"text": "Footer text",
			"iconURL": "https://example.com/icon.png"
		}
	}
}
```

#### Fields
Two equivalent commands
```JSON
{
	"embed": {
		"message_title": "Fields snippet",
		"fields": [
			{
				"title": "Field title",
				"description": "Field content",
				"short": false
			}
		]
	}
}
```
```JSON
{
	"embed": {
		"message_title": "Fields snippet",
		"fields": [
			{
				"name": "Field title",
				"value": "Field content",
				"inline": false
			}
		]
	}
}
```

# Command snippets

## author
Author is the [user](#user) who sent the message.

## mention
Mention is the first mentioned [user](#user).

## mentions
Mentions is a collection consisting of [users](#user) with all actions available for the accessed user.

### .all
Runs actions for all users with a ", " between each user.
```js
(mentions.all.tag)
```
### .first
Return the first mentioned user.
```js
(mentions.first.username)
```
### .last
Return the last mentioned user.
```js
(mentions.last.tag)
```
### .nth()
Returns the nth user of mentions starting from 1.
```js
(mentions.nth(1).tag)
```
## user
For any given user(s) the following properties are available

### .id
The id of a given user, meaning `@Tarren#9722 -> 157101769858613248`
```js
(author.id)
(mentions.nth(2).id)
```
### .mention
The @ mention of a given user, meaning `@Tarren#9722`
```js
(author.username)
(mentions.first.username)
```
### .nickname
The nickname of a given user, meaning `Jihyo#2423`
```js
(author.username)
(mentions.nth(2).tag)
```
### .pfp()
The profile picture of a given user as a link to a png or gif if animated.
```js
(author.pfp())
(mentions.first.pfp(256))
```
*Note: resolution defaults to 128 x 128 unless one of the following is provided 16, 32, 64, 128, 256, 512, 1024, 2048, 4096.*

### .tag
The tag of a given user, meaning `Jihyo#2423`
```js
(author.tag)
(mentions.last.tag)
```
### .username
The username of a given user, meaning `Tarren` not `Tarren#9722`
```js
(author.username)
(mentions.first.username)
```

## Actions
Actions can be run and will provide a result from a command, 

### mute()
Mutes one or several users for a given amount of time.
```js
mute(author, 1m)
mute(mentions.all, 5m)
```

### giveRole()
Gives a role to one or several users.
```js
giveRole(author, 724239960894472192)
```

### removeRole()
Removes a role from one or several users.
```js
removeRole(mentions.all, 724239960894472192)
```

### toggleRole()
Toggles a role for one or several users.
```js
toggleRole(mentions.first, 724239960894472192)
```