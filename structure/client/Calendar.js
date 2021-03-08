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
        require('fs').writeFileSync('./calendar.json', JSON.stringify(this.calendar));
        console.log(`Calendar updated.`);

    }

    parseEvents() {

        let { events } = this.calendar;
        events.forEach(event => {
            event.timestamp = new Date(event.start).getTime();
        });

        events = events.filter(event => {
            const { repeat, timestamp } = event;
            const now = Date.now();
            //console.log(repeat, timestamp, now, new Date(repeat.end))
            // Needs some further logic fuckery to figure out repeating events
            return now < timestamp || (repeat.type !== "" && new Date(repeat.end).getTime() > now);
        });

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