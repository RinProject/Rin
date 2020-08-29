# Moderation

## Ban
Bans a mentioned user.
### Required Permissions
* Ban Members

Examples: 
```
;ban @Qred#0122
;ban 186563462330056704
```

---

## Kick
Kicks a mentioned user.
### Required Permissions
* Kick Members

Examples: 
```
;kick @Qred#0122
;kick 186563462330056704
```

---

## Lock
Overwrites permissions to speak in channel it is called in.
### Required Permissions
* Manage Channels

Example: 
```
;lock
```

---

## Log
Enables the logging of server events, to use this you must first setup a logging channel for all logs.

	;log channels #logs

**This will by not enable any logs.**

### TL;DR
To setup send each row as a seprate message with the channels you wish to assign.

	;log channels #logs
	;log enable all

To set specific channels per log type

	;log channel message #message-logs
	;log channel mod #mod-logs
	;log channel server #server-logs

### Setting log channel(s)
	;log channel #logs
	;log channel [log type] #channel

#### Log types
+ **Message**
	+ Message logs; deletes, invites, and reactions.
+ **Server**
	+ Server logs; channel updates, empji updates, guild updates, and role updates.
+ **Mod**
	+ Moderation logs contain ban logs, users joining and leaving, and member nickname/role changes.

### Setting what is logged
	;log [enable/disable] [log type]
	;log [enable/disable] all
	;log [enable/disable] [event]

<details>
	<summary>List of events</summary>

### Message

#### Message change
	channelPinsUpdate
	messageDelete
	messageDeleteBulk
	messageUpdate

#### Reaction
	messageReactionAdd
	messageReactionRemove
	messageReactionRemoveAll
	messageReactionRemoveEmoji

#### Misc
	inviteCreate
	inviteDelete

### Server

#### Channel
	channelCreate
	channelDelete
	channelUpdate
	webhookUpdate

#### Emoji
	emojiCreate
	emojiDelete
	emojiUpdate

#### Guild
	guildUpdate
	guildIntegrationsUpdate

#### Role
	roleCreate
	roleDelete
	roleUpdate

### Mod

#### Bans
	guildBanAdd
	guildBanRemove

#### Join/leave
	guildMemberAdd
	guildMemberRemove

#### Member change
	guildMemberUpdate
	userUpdate
</details>

### Required Permissions
* Administrator

Examples:
```
;log channel #logs
;log enable all
;log enable message
;log disable message
;log enable mod
;log enable server
;log channel message #message-logs
;log channel mod #mod-logs
;log channel server #server-logs
;log disable channelPinsUpdate
;logs
```

### Aliases
* Logs

---

## Mute
Mutes given member with the option to add a reason for the mute. Mutes are checked twice a minute meaning that an automatic unmute can be up to half a minute late.
### Required Permissions
* Manage Roles

Examples: 
```
;mute @Jihyo#2423 1d Being lazy
;mute 157101769858613248 1h
;mute @Tarren#9722 30m Too tardy
```

---

## Purge
Purges a given number of messages.
### Required Permissions
* Manage Messages

Examples: 
```
;purge
;p 99
```
### Aliases
* P

---

## Unban
Unbans a mentioned user.
### Required Permissions
* Ban Members

Examples: 
```
;unban @Qred#0122
;unban 186563462330056704
```

## Unmute
Unmutes given member.
### Required Permissions
* Manage Roles

Examples: 
```
;unmute @Jihyo#2423
;unmute 157101769858613248
```

---

## Warn 
Warns mentioned user and can also remove/restore warnings
### Required Permissions
* Ban members

Examples:
```
;warn @Jihyo#2423 Being a chuckle fuck
;warn 571487483016118292 writing bad code
;warn remove 6a6169c312
;warn restore 6a6169c312
```
---

## Warnings 
Displays warnings and their ids of a user, or a specific warning by using the ID  of the warning
### Required Permissions
* Ban members

Examples:
```
;warnings @Qred#0122
;warnings 157101769858613248
;warning 6a6169c312
```
### Aliases
* warning
---

