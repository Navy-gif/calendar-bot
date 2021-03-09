const https = require('https');

class Calendar {

    constructor(client) {

        this.client = client;
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

        const now = Date.now();
        const future = now + 24 * 60 * 60 * 1000;
        const eventsToday = this.events.filter() //TODO: filter out events that happen today

    }

    parseEvents() {

        let { events } = this.calendar;
        events.forEach(event => {
            event.timestamp = Date.parse(event.start);
        });

        events = events.filter(event => {
            const { repeat, timestamp } = event;
            const now = Date.now();
            console.log(repeat, timestamp, now, Date.parse(repeat.end));
            console.log(now < timestamp, repeat.type !== "" && (Date.parse(repeat.end) || 0) > now, now < timestamp || repeat.type !== "" && (Date.parse(repeat.end) || 0) > now);
            // Needs some further logic fuckery to figure out repeating events
            return now < timestamp || repeat.type !== "" && (Date.parse(repeat.end) || 0) > now;
            //TODO: store a timestamp for the next time an event occurs based on the repeat property
        });

        return events;

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