const { default: axios } = require('axios');

const Vibrant = require('node-vibrant');

const fs = require('fs');

const { MessageActionRow, MessageEmbed, MessageAttachment } = require('discord.js');

const chartDetails = require('../../assets/weatherChart');

const chartExporter = require('highcharts-export-server');

const { time } = require('@discordjs/builders');

// types: https://discordjs.guide/interactions/slash-commands.html#option-types

module.exports = {
    data: {
        name: 'weather',
        name_localizations: {
            'en-US': 'weather',
            'es-ES': 'tiempo',
            'fr': 'météo',
        },
        description: 'Get weather informations and metrics from a given location',
        description_localizations: {
            'en-US': 'Get weather informations and metrics from a given location',
            'es-ES': 'Obtener información meteorológica y métricas de una ubicación dada',
            'fr': 'Obtenir des informations météorologiques et métriques à partir d\'une localisation donnée',
        },
        options: [
            {
                type: 3,
                name: 'location',
                name_localizations: {
                    'en-US': 'location',
                    'es-ES': 'ubicación',
                    'fr': 'localisation',
                },
                description: 'Location to get weather information from',
                description_localizations: {
                    'en-US': 'city, zip, etc.',
                    'es-ES': 'ciudad, código postal, etc.',
                    'fr': 'ville, code postal, etc.',
                },
                required: true,
                autocomplete: true,
            },
            {
                type: 10,
                name: 'longitude',
                name_localizations: {
                    'en-US': 'longitude',
                    'es-ES': 'longitud',
                    'fr': 'longitude',
                },
                description: 'Longitude to get weather information from',
                description_localizations: {
                    'en-US': 'Longitude to get weather information from',
                    'es-ES': 'Longitud de la cual obtener información meteorológica',
                    'fr': 'Longitude à partir de laquelle obtenir des informations météorologiques',
                },
                required: false,
            },
            {
                type: 10,
                name: 'latitude',
                name_localizations: {
                    'en-US': 'latitude',
                    'es-ES': 'latitud',
                    'fr': 'latitude',
                },
                description: 'Latitude to get weather information from',
                description_localizations: {
                    'en-US': 'Latitude to get weather information from',
                    'es-ES': 'Latitud de la cual obtener información meteorológica',
                    'fr': 'Latitude à partir de laquelle obtenir des informations météorologiques',
                },
            },
        ],
    },
    async execute(client, interaction) {
        chartExporter.initPool();
        await interaction.deferReply();

        const location = interaction.options.getString('location');
        const lon = interaction.options.getNumber('lon');
        const lat = interaction.options.getNumber('lat');

        const response = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
            params: {
                appid: process.env.OWN_API_KEY,
                q: !lon || !lat ? location : '',
                lat: lon && lat ? lat : '',
                lon: lon && lat ? lon : '',
                lang: interaction.locale,
                units: interaction.locale == 'fr' ? 'metric' : 'default',
            },
        }).catch(async (err) => {
            await interaction.editReply(err.response.data.message);
        });

        const data = [];
        for (const v of response.data.list) {
            data.push([v.dt * 1000, v.main.temp]);
        }

        chartDetails.options.series = [];
        chartDetails.options.series.push(
            {
                name: `Température (°${interaction.locale == 'fr' ? 'C' : 'F'})`,
                pointInterval: 24 * 60 * 60 * 1000,
                lineWidth: 1,
                data: data,
            },
        );

        // Filename of the output
        const outputFile = './assets/weatherChart.png';
        await chartExporter.export(chartDetails, (err, res) => {

			// Get the image data (base64)
            const imageb64 = res.data;

			// Save the image to file
			fs.writeFileSync(outputFile, imageb64, 'base64', function(err) {
				if (err) console.log(err);
            });

            chartExporter.killPool();
        });

        const image = new MessageAttachment(outputFile);

        const city = response.data.city;

        const list = response.data.list.filter((v, i) => i % 4 == 0);

        // Make all the embeds
        const embeds = await Promise.all(list.map((i, k) => {
            return makeEmbed(i, city, interaction.locale, interaction.user, k, list.length - 1);
        }));

        let page = 0;

        const mapLink = new MessageActionRow().addComponents([
            {
                type: 'BUTTON',
                style: 'LINK',
                url: `https://www.windy.com/?${city.coord.lat},${city.coord.lon},9`,
                label: 'Carte météorologique',
            },
        ]);

        // Reply with the fist embed
        await interaction.editReply({ embeds: [embeds[page]], components: [getButtons(page, list.length), mapLink], files: [image] });

        // Button interaction
        const collector = interaction.channel.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', async i => {
            await i.deferUpdate();
            switch (i.customId) {
                case 'previous':
                    page--;
                    await interaction.editReply({ embeds: [embeds[page]], components: [getButtons(page, list.length), mapLink] });
                    break;
                case 'next':
                    page++;
                    await interaction.editReply({ embeds: [embeds[page]], components: [getButtons(page, list.length), mapLink] });
                break;
            }
        });

        collector.on('end', collected => {
            interaction.editReply({ content: `Délai d'attente dépassé (Vous avez tourné ${collected.length} pages).`, components: [mapLink] });
        });

    },
    async autoComplete(client, interaction) {
        const location = interaction.options.getString('location');

        const options = [];
        if (location) {
            options.push({
				'name': location,
				'value': location,
            });

            if (location.length > 3) {
                const response = await axios.get('https://api.openweathermap.org/data/2.5/find', {
                    params: {
                        appid: process.env.OWN_API_KEY,
                        q: location,
                        lang: interaction.locale,
                        sort: 'population',
                    },
                }).catch(async (err) => {
                    console.log(err);
                    await interaction.editReply({ content: 'erreur', ephemeral: true });
                });

                for (const i of response.data.list) {
                    options.push({
                        name: `${i.name} (${i.sys.country})`,
                        value: `${i.name}, ${i.sys.country}`,
                    });
                }

            }
            await interaction.respond(options);
        }
    },
};

const makeEmbed = async (item, city, locale, user, page, maxPage) => {
    const palette = await Vibrant.from(`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`).getPalette((err, p) => p);

    const cardinals = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

    const direction = Math.round((item.wind.deg / 360) * cardinals.length) % cardinals.length;

    const datetime = item.dt - city.timezone;


    return new MessageEmbed({
        color: palette.Vibrant._rgb,
        title: `BULLETIN MÉTÉOROLOGIQUE\n${time(datetime, 'f')}`,
        description: `${item.weather[0].description}`,
        author: {
            name: `${user.username}#${user.discriminator}`,
            icon_url: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`,
        },
        thumbnail: {
            url: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
        },
        image: {
            url: 'attachment://weatherChart.png',
        },
        fields: [
            {
                name: '📌  Localisation',
                value: `${city.name} (${city.country})`,
                inline: true,
            },
            {
                name: '🌡️  Température',
                value: `${item.main.temp} °${locale == 'fr' ? 'C' : 'F'}`,
                inline: true,
            },
            {
                name: '🍃  Vent',
                value: `${Math.round(item.wind.speed * 3.6)} km/h ${cardinals[direction]}`,
                inline: true,
            },
            {
                name: '💧  Humidité',
                value: `${item.main.humidity}%`,
                inline: true,
            },
            {
                name: '☁️  Nuage',
                value: `${item.clouds.all}%`,
                inline: true,
            },
            {
                name: '⏲️  Pression',
                value: `${item.main.pressure} hPa`,
                inline: true,
            },
            {
                name: '🌫️  Visibilité',
                value: `${Math.floor(item.visibility / 1000)} km`,
                inline: true,
            },
            {
                name: '☀️  Aube',
                value: `${new Date(city.sunrise * 1000).toLocaleTimeString(locale, { hour: '2-digit', minute:'2-digit', timeZoneName: 'short' })}`,
                inline: true,
            },
            {
                name: '🌙  Crépuscule',
                value: `${new Date(city.sunset * 1000).toLocaleTimeString(locale, { hour: '2-digit', minute:'2-digit', timeZoneName: 'short' })}`,
                inline: true,
            },
        ],
        footer: {
            text: `Page ${page + 1}/${maxPage + 1} `,
            icon_url: `https://flagcdn.com/16x12/${city.country.toLowerCase()}.png`,
        },
        timestamp: new Date(),
    });

};

const getButtons = (page, maxPage) => {
    return new MessageActionRow().addComponents([
        {
            type: 'BUTTON',
            style: 'PRIMARY',
            customId: 'previous',
            label: '❮',
            disabled: page == 0,
        },
        {
            type: 'BUTTON',
            style: 'PRIMARY',
            customId: 'next',
            label: '❯',
            disabled : page == maxPage - 1,
        },
    ]);
};