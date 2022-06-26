const pino = require('pino');
const fs = require('node:fs');
const pinoms = require('pino-multi-stream');

const streams = [
    { stream: process.stdout },
    { stream: fs.createWriteStream(`./logs/${new Date().toISOString()}-logs.json`, { flags: 'a' }) },
];

module.exports = pino({}, pinoms.multistream(streams));