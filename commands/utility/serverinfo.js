module.exports = {
    async run(message, args) {
        let numChannels = 0;
        let voiceChannels = 0;
        let textChannels = 0;

        let people = 0;
        let bots = 0;

        let roles = 0;

        message.guild.channels.cache.each(channel => {
            if (channel.type != 'category')
                numChannels++;
            if (channel.type == 'voice')
                voiceChannels++;
            if (channel.type == 'text')
                textChannels++;
        });

        message.guild.members.cache.each(member => {
            if (member.user.bot)
                bots++;
            else
                people++;
        });

        message.guild.roles.cache.each(role => {
            if (role)
                roles++;
        });
        
        message.channel.send({
            embed: {
                title: `Info for ${message.guild.name}`,
                color: 0xFF80CC,
                thumbnail: {
                    url: message.guild.iconURL()
                },
                author: {
                    name: message.guild.name,
                    iconURL: message.guild.iconURL()
                },
                fields: [
                    {
                        name: 'Owner',
                        value: `${message.guild.owner.toString()}`,
                        inline: true
                    },
                    {
                        name: 'Region',
                        value: `${(await message.guild.fetchVoiceRegions()).findKey(region => region.optimal)}`,
                        inline: true
                    },
                    {
                        name: 'Prefix',
                        value: `${message.client.prefix}`,
                        inline: true
                    },
                    {
                        name: 'Members',
                        value: `${message.guild.memberCount}`,
                        inline: true
                    },
                    {
                        name: 'Humans',
                        value: `${people}`,
                        inline: true
                    },
                    {
                        name: 'Bots',
                        value: `${bots}`,
                        inline: true
                    },
                    {
                        name: 'Channels',
                        value: `${numChannels}`,
                        inline: true
                    },
                    {
                        name: 'Text',
                        value: `${textChannels}`,
                        inline: true
                    },
                    {
                        name: 'Voice',
                        value: `${voiceChannels}`,
                        inline: true
                    },
                    {
                        name: 'Roles',
                        value: `${roles}`,
                        inline: true
                    },
                    {
                        name: 'Emojis',
                        value: `${message.guild.emojis.cache.size}`,
                        inline: true
                    },
                    {
                        name: 'Verification',
                        value: `${message.guild.verificationLevel}`,
                        inline: true
                    },
                    {
                        name: 'Created At',
                        value: `${message.guild.createdAt}`,
                        inline: false
                    }
                ],
                footer: {
                    text: `id: ${message.guild.id}`
                },
                timestamp: +new Date
            }
        });
    },
    aliases: ['info'],
    description: 'Returns info about the server',
    detailed: 'Returns info about the server',
    examples: prefix => `${prefix}serverinfo`,
    name: 'serverinfo',
    perms: null
}