# Rin
A general purpose Discord bot written in JavaScript

## Setup
* Install [Nodejs](https://nodejs.org/en/) if not already installed. **Version 12.0.0 or newer is required.** You can check your Nodejs version with `node -v`.
* Install [Yarn](https://classic.yarnpkg.com/en/docs/install) if not already installed.
* You will also need a [mongoDB](https://www.mongodb.com/try/download/community) instance to connect to.
* Run `yarn install`
* Build with `yarn build`
* Copy and rename config-template.json to config.json, fill in all data
	* Token; get pre-existing bot token or create a new one through [Discord's Dev Portal](https://discord.com/developers/applications). **Note: discord.js will throw an error if this is not included**
    	* Bot requires both `PRESENCE INTENT` and `SERVER MEMBERS INTENT` see [documentation](https://discord.com/developers/docs/topics/gateway#privileged-intents) and [official article](https://support.discord.com/hc/en-us/articles/360040720412) about privacy for more info.
	* Pick your desired prefix for example: `;`, `!`, `r!` or something entirely different!
	* Whether or not to enable the help command, defaults to true if undefined.
	* Channel; id of a text channel to which the bot shall log.
	* Owners; an array of ids of the bot maintainers/owners, provide ids as strings (within double quotes) or their values will end up corrupted. If you do not know how to get a users id read [this Discord article](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-).
	* colors; change these to change up your colour scheme, stored as hex colours should be a string starting with '0x' meaning `0xFF80CC` and not `#FF80CC`
* Run `yarn start`
* If you wish to add or modify commands without a reboot owners can simply send the command `;reload` and `;reload [command]`. 

*Note: reloading a specific command only works if said command has already been loaded once, so to add a new command reload all commands.*

## Development
* after install run 
	* `yarn build-dev`
	* `yarn test`
