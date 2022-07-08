const { MessageActionRow } = require('discord.js');

module.exports = class Pager {
    constructor(interaction, embeds, index) {
        this.interaction = interaction;
        this.embeds = embeds;
        this.index = index;
        this.length = embeds.length;
    }


    /**
     * Run the pager collector
     * @param  {} extraButtons if you want to add extra buttons
     */
    run(extraButtons = null) {
        const collector = this.interaction.channel.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', async i => {
            await i.deferUpdate();
            switch (i.customId) {
                case 'previous':
                    this.index--;
                    await this.interaction.editReply({ embeds: [this.embeds[this.index]], components: [this.makeButton(), extraButtons] });
                break;
                case 'next':
                    this.index++;
                    await this.interaction.editReply({ embeds: [this.embeds[this.index]], components: [this.makeButton(), extraButtons] });
                break;
                }
        });

        collector.on('end', collected => {
            this.interaction.editReply({ content: `Délai d'attente dépassé (Vous avez tourné ${collected.size} pages).`, components: [extraButtons] });
        });
    }

    makeButton() {
        return new MessageActionRow().addComponents([
        {
            type: 'BUTTON',
            style: 'PRIMARY',
            customId: 'previous',
            label: '❮',
            disabled: this.index == 0,
        },
        {
            type: 'BUTTON',
            style: 'PRIMARY',
            customId: 'next',
            label: '❯',
            disabled: this.index == this.length - 1,
        },
    ]);
    }
};