const https = require('https');

const CONSTANTS = {
    week: 7 * 24 * 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    hour: 60 * 60 * 1000
};

class Calendar {

    constructor(client) {

        this.client = client;
        this.channelID = client._options.channel;
        this.calendarURL = client._options.calendarURL;

    }

    async update() {

        console.log(`Attempting calendar update.`);
        this.calendar = await this.request(this.calendarURL);
        this.events = this.parseEvents();
        this.updated = Date.now();
        this.calendar.events = this.events;
        require('fs').writeFileSync('./calendar.json', JSON.stringify(this.calendar));
        console.log(`Calendar updated.`);

    }

    async post() {
        
        //console.log(`Events today: ${JSON.stringify(eventsToday)}`);

        const channel = await this.client.channels.fetch(this.channelID);
        await channel.send(`**Today's events**\n\`\`\`${JSON.stringify(this.eventsToday)}\`\`\``);

    }

    parseEvents() {

        let { events } = this.calendar;
        const now = Date.now();
        const future = now + CONSTANTS.day; //1 day future

        // Add missing timestamps
        events.forEach(event => {

            event.timestamp = Date.parse(event.start);
            const { repeat, timestamp } = event;

            // Needs some further logic fuckery to figure out repeating events that don't have an end date
            if (repeat.type !== "") {
                const recurrences = parseInt(repeat.end);
                if (!isNaN(recurrences) && repeat.end.length <= 2) { //if the end property has an integer value, rather than a date, it indicates the number of recurrences, at least I think
                    // Convert a recurrence indicator to the end timestamp
                    repeat.endTimestamp = timestamp + CONSTANTS[repeat.type.toLowerCase()] * parseInt(repeat.interval) * recurrences;
                } else {
                    repeat.endTimestamp = Date.parse(repeat.end);
                }

                let i = 0;
                let time = timestamp;
                while (time < now && repeat.endTimestamp > now) {

                    time = timestamp + CONSTANTS[repeat.type.toLowerCase()] * parseInt(repeat.interval) * i;
                    i++;
                    
                    if (time > now) {
                        repeat.next = time;
                        break;
                    } else if (i > 100) break;
                }

            }

        });

        //Filter out expired events
        events = events.filter(event => {

            const { repeat, timestamp } = event;

            // console.log(repeat, timestamp, now, Date.parse(repeat.end));
            // console.log(
            //     now < timestamp,
            //     repeat.type !== "" && (Date.parse(repeat.end) || 0) > now,
            //     now < timestamp || repeat.type !== "" && (Date.parse(repeat.end) || 0) > now
            // );

            //     Future event    OR Recurring event whose timestamp passed but recurrence hasn't ended -- this needs some math to figure out the ones that don't have a set time, rather have a number of times they pass
            return now < timestamp || repeat.type !== "" && repeat.endTimestamp > now;
        });

        //Configure events for this day
        this.eventsToday = this.events.filter(event => {
            return event.timestamp > now && event.timestamp < future || event.repeat.type !== "" && event.repeat.next > now && event.repeat.next < future;
        });
        this.eventsToday.forEach(event => {
            const time = event.repeat?.next || event.timestamp;
            event.reminder = setTimeout(this._oneHourReminder.bind(this), time - CONSTANTS.hour, event);
        });

        return events;

    }

    async _oneHourReminder(event) {

        event.reminder = setTimeout(this._eventStart.bind(this), CONSTANTS.hour, event);
        const channel = await this.client.channels.fetch(this.channelID);

        const embed = {
            title: `One hour reminder for **${event.title}**`
        };

        await channel.send({ embed });

    }

    request(url) {

        return new Promise((resolve, reject) => {

            https.get(url, (response) => {

                if (response.statusCode !== 200) reject(new Error(`Calendar API returned with a non-200 code. Status ${response.statusCode}: ${response.statusMessage}`));

                response.setEncoding('utf-8');
                let raw = '';

                response.on('data', (data) => { raw += data; });

                response.on('end', () => {
                    try {
                        const parsed = JSON.parse(raw);
                        resolve(parsed);
                    } catch (error) {
                        reject(error);
                    }
                });

            });

        });

    }

}

module.exports = Calendar;