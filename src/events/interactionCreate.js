module.exports = {
	name: 'interactionCreate',
	async execute(client, interaction) {
        // if (!interaction.isCommand() || !interaction.isModalSubmit()) return;

        const command = client.commands.get(interaction.commandName);

        if (command) {
            try {
                await command.execute(client, interaction);
            }
            catch (error) {
                console.error(error);
                await interaction.reply({ content: `There was an error while executing this command! \n \`\`\`${error}\`\`\``, ephemeral: true });
            }
        }
	},
};