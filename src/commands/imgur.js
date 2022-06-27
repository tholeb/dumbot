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

		if (!album.startsWith('https://imgur.com/a/')) {
			const embed = {
				title: 'Error',
				description: 'The album url is not valid',
				color: 0xFF0000,
			};
			return interaction.reply({ embed: [embed] });
		}


		const albumID = album.split('/').pop();

		const response = await axios.get(`https://api.imgur.com/3/album/${albumID}`, {
            headers: {
                Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`,
            },
        }).catch(async (err) => {
            await interaction.editReply(err.response.data.message);
		});

		const images = response.data.data.images;

		const embeds = await Promise.all(images.map((i, k) => {
			return makeEmbed(i, interaction.user, k, images.length - 1);
		}));

		let page = 0;

		const imgurLinks = new MessageActionRow().addComponents([
            {
                type: 'BUTTON',
                style: 'LINK',
                url: response.data.data.link,
                label: 'Album\'s link',
            },
        ]);


		// Button interaction
        const collector = interaction.channel.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', async i => {
            await i.deferUpdate();
            switch (i.customId) {
				case 'previous':
					page--;
                    await interaction.editReply({ embeds: [embeds[page]], components: [Pager(page, images.length), imgurLinks] });
                    break;
					case 'next':
						page++;
						await interaction.editReply({ embeds: [embeds[page]], components: [Pager(page, images.length), imgurLinks] });
						break;
					}
        });

        collector.on('end', collected => {
			interaction.editReply({ content: `Délai d'attente dépassé (Vous avez tourné ${collected.length} pages).`, components: [imgurLinks] });
        });

		return interaction.editReply({ embeds: [embeds[page]], components: [Pager(page, images.length), imgurLinks] });
	},
};

const makeEmbed = async (image, user, index, length) => {
	const palette = await Vibrant.from(image.link).getPalette((err, p) => p);

	return new MessageEmbed({
        color: palette.Vibrant._rgb,
        title: 'My album title',
		description: 'My album description',
		url: image.link,
        author: {
            name: `${user.username}#${user.discriminator}`,
            icon_url: user.avatarURL(),
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
				name: 'Tags',
				value: image.tags.join(', ') || 'No tags',
				inline: true,
			},
		],
        footer: {
            text: `Page ${index + 1}/${length + 1}`,
		},
		timestamp: new Date(image.datetime * 1000).toISOString(),
    });
};