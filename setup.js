/* eslint-disable no-console */
const fs = require('fs');

const DEFAULT = {
    "prefix": "!!",
    "token": "REPLACE ME WITH THE CLIENT TOKEN",
    "calendarURL": "REPLACE ME WITH THE CALENDAR JSON API URL"
};

if (!fs.existsSync('./config.json')) {
    console.log('Config file doesn\'t exist, creating...');
    fs.writeFileSync('./config.json', JSON.stringify(DEFAULT));
} else console.log('Config file exists already.');