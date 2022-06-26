const { codeBlock } = require('@discordjs/builders');

module.exports = {
    name: 'interactionCreate',
    async execute(client, interaction) {
        const command = client.commands.get(interaction.commandName);
        if (interaction.isCommand()) {
            try {
                await command.execute(client, interaction);

                console.log('autocompleting');
                await interaction.autoComplete(client, interaction);
            }
            catch (error) {
                console.error(error);
                await interaction.reply({ content: `There was an error while executing this command! \n ${codeBlock(error)}`, ephemeral: true });
            }
        }

        if (interaction.isAutocomplete()) {
            try {
                await command.autoComplete(client, interaction);
            }
            catch (error) {
                console.error(error);
            }
        }
    },
};