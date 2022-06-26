const { SlashCommandBuilder, hyperlink } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('invite')
		.setDescription('Replies with the invitation link to invite this bot to your server!'),
    async execute(client, interaction) {
		const embed = {
			thumbnail: {
				url: client.user.avatarURL(),
			},
			author: {
				name: client.user.username,
				icon_url: client.user.avatarURL(),
			},
			title: '🔗 Invite Link',
			color: 'RANDOM',
			timestamp: new Date(),
			description: 'You can invite this bot to your server by using the following link',
			fields: {
				name: '\u200b',
				value: hyperlink('Click here to invite this bot to your server!', `https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=8`),
			},
		};

		return interaction.reply({ embeds: [embed] });

	},
};