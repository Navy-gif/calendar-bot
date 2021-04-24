/* eslint-disable no-console */
const fs = require('fs');

const DEFAULT = {
    "prefix": "!!",
    "token": "REPLACE ME WITH THE CLIENT TOKEN",
    "calendarURL": "REPLACE ME WITH THE CALENDAR JSON API URL",
    "clientOptions": {

    },
    "channel": "REPLACE ME WITH CHANNEL ID",
    "adminRoles": [],
    "updateCalendarCron": "55 23 * * *",
    "postEventsCron": "0 0 * * *",
    "timeZoneOffset": "-07:00",
    "notificationRole": "REPLACE ME WITH ROLE ID"
};

if (!fs.existsSync('./config.json')) {
    console.log('Config file doesn\'t exist, creating...');
    fs.writeFileSync('./config.json', JSON.stringify(DEFAULT));
} else console.log('Config file exists already.');