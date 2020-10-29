const { asyncDB } = require('../handler/utils');

module.exports = (client) => {
	client.on('message', async (m) => {
		if (m.author.bot) return;

		// TODO <sr229>: convert this raw SQL queries to TypeORM calls instead
		if (m.guild && !(await client.isCommand(m))) {
			let role = m.guild.roles.resolve(
				await asyncDB.get(db, 'SELECT role FROM expRole WHERE guild = (?);', [m.guild.id])
			);

			if (role && m.member.roles.cache.get(role.id)) return;

			let expGain = 10;
			let time = +new Date();
			let xp = await asyncDB.get(db, 'SELECT * FROM exp WHERE user =(?) AND guild = (?)', [
				m.author.id,
				m.guild.id,
			]);

			// FIXME<sr229>: not sure if we should store lastMsg for this? This may cause Discord to question what's the need to store the last message is stored for.
			if (xp && xp.exp)
				if (xp.lastMessage < time - 60000)
					asyncDB.run(
						db,
						'UPDATE exp SET exp = (?), lastMessage = (?) WHERE user = (?) AND guild = (?)',
						[xp.exp + expGain, time, m.author.id, m.guild.id]
					);
				//FIXME <sr229> : This is where using ORM would be really needed, it'll be easier to insert new users...
				else
					asyncDB.run(
						db,
						'INSERT INTO exp(user, exp, lastMessage, guild) VALUES((?), (?), (?), (?))',
						[m.author.id],
						expGain,
						time,
						m.guild.id
					);
		}
	});
};
