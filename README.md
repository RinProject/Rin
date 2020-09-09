# Rin
A general purpose Discord bot written in JavaScript

## Setup
* Install [Nodejs](https://nodejs.org/en/) if not already installed. **Version 12.0.0 or newer is required.** You can check your Nodejs version with `node -v`.
* Run `npm i`
* Build with `npm run build`(*Note: during development `npm run build-watch` is recommended as it doesn't strip comments*)
* Copy and rename config-template.json to config.json, fill in all data
	* Token; get pre-existing bot token or create a new one through [Discord's Dev Portal](https://discord.com/developers/applications). **Note: discord.js will throw an error if this is not included**
	* Pick your desired prefix for example: `;`, `!`, `r!` or something entirely different!
	* **Do not change the directory folder unless you know what you are doing**
	* Whether or not to enable the help command, defaults to true if undefined.
	* Channel; id of a text channel to which the bot shall log.
	* Owners; an array of ids of the bot maintainers/owners, provide ids as strings (within double quotes) or their values will end up corrupted. If you do not know how to get a users id read [this Discord article](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-). **Note: including this is mandatory!**
	* colors; change these to change up your colour scheme, stored as hex colours should be a string starting with '0x' meaning `0xFF80CC` and not `#FF80CC`
	* enableWeb; whether or not to run web components
	* Set a redirect under oauth2 redirect to be, `https://localhost:[port]/auth/redirect` with your configured port, example `https://localhost:1337/auth/redirect`
	![Screenshot of dashboard](https://i.imgur.com/anqMFOF.png)
	* Client secret and client id from the panel developer panel
	* Redirect, **do not touch**
	* Port, the port the site will run on
* Run `npm start`
* If you wish to add or modify commands without a reboot owners can simply send the command `;reload` and `;reload [command]`. 

*Note: reloading a specific command only works if said command has already been loaded once, so to add a new command reload all commands.*

## Testing
* after install run 
	* `npm run build-watch`
	* `npm test`
