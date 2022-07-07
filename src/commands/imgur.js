const { MessageActionRow, MessageEmbed } = require('discord.js');

const axios = require('axios');

const Vibrant = require('node-vibrant');

const humanFileSize = require('../utils/humanFileSize');

const Pager = require('../utils/Pager');

module.exports = {
	data: {
		name: 'imgur',
        description: 'Show imgur album on discord',
        description_localizations: {
            'en-US': 'Show imgur album on discord',
            'es-ES': 'Mostrar el álbum de imgur en discord',
            'fr': 'Afficher un album Imgur sur Discord',
        },
        options: [
            {
                type: 3,
                name: 'album',
                name_localizations: {
                    'en-US': 'album',
                    'es-ES': 'álbum',
                    'fr': 'album',
                },
                description: 'The album url (https://imgur.com/a/<random id>)',
                description_localizations: {
                    'en-US': 'The album url (https://imgur.com/a/<random id>)',
                    'es-ES': 'La url del álbum (https://imgur.com/a/<random id>)',
                    'fr': 'L\'url de l\'album (https://imgur.com/a/<random id>)',
                },
                required: true,
            },
        ],
	},
	async execute(client, interaction) {
		await interaction.deferReply();
		const album = interaction.options.getString('album');

		if (!album.startsWith('https://imgur.com/')) {
			const embed = {
				title: 'Error',
				description: 'The album url is not valid',
				color: 0xFF0000,
			};
			return interaction.editReply({ embed: [embed] });
		}


		const albumID = album.split('/').pop();

		const response = await axios.get(`https://api.imgur.com/3/album/${albumID}`, {
            headers: {
                Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`,
            },
        }).catch(async (err) => {
            await interaction.editReply(err.response.data.message);
		});

		const format = ['image/png', 'image/jpeg', 'image/gif', 'image/*'];

		const images = response.data.data.images.filter((i) => format.includes(i.type));

		const embeds = await Promise.all(images.map(async (image, k) => {
			const palette = await Vibrant.from(image.link).getPalette((err, p) => p);

			return new MessageEmbed({
				color: palette.Vibrant._rgb,
				title: response.data.data.title,
				description: response.data.data.description ||= '',
				url: response.data.data.link,
				author: {
					name: `${interaction.user.username}#${interaction.user.discriminator}`,
					icon_url: interaction.user.avatarURL(),
				},
				thumbnail: {
					url: 'https://sunrust.org/wiki/images/f/fc/Imgur_icon.png',
				},
				image: {
					url: image.link,
				},
				fields: [
					{
						name: 'Title',
						value: image.title ||= 'No title',
						inline: true,
					},
					{
						name: 'Description',
						value: image.description ||= 'No description',
						inline: true,
					},
					{
						name: 'Ratio',
						value: `${image.width}x${image.height}`,
						inline: true,
					},
					{
						name: 'Size',
						value: humanFileSize(image.size) || 'No size',
						inline: true,
					},
					{
						name: 'NSFW',
						value: image.nsfw ? 'Yes' : 'No',
						inline: true,
					},
					{
						name: 'Views',
						value: `${image.views}` || 'No views',
						inline: true,
					},
					{
						name: 'Link',
						value: `${image.link}`,
						inline: true,
					},
					{
						name: 'Tags',
						value: image.tags.join(', ') || 'No tags',
						inline: true,
					},
				],
				footer: {
					text: `Page ${k + 1}/${images.length + 1}`,
				},
				timestamp: new Date(image.datetime * 1000).toISOString(),
			});
		}));

		const page = 0;

		const imgurLinks = new MessageActionRow().addComponents([
            {
                type: 'BUTTON',
                style: 'LINK',
                url: response.data.data.link,
                label: 'Album\'s link',
            },
		]);

		const pager = new Pager(interaction, embeds, page);
		pager.run(imgurLinks);


		return interaction.editReply({ embeds: [embeds[page]], components: [pager.makeButton(), imgurLinks] });
	},
};