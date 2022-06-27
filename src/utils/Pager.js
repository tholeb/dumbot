const { MessageActionRow } = require('discord.js');

module.exports = (page, maxPage) => {
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