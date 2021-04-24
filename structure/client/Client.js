const { Client } = require('discord.js');
const { CommandHandler, Calendar } = require('./index.js');
const scheduler = require('node-schedule');

class CalendarBot extends Client {

    constructor(options) {

        super(options.clientOptions);
        this._options = options;

    }

    async init() {

        this.commandHandler = new CommandHandler(this);
        await this.commandHandler.init();

        this.calendar = new Calendar(this);
        await this.calendar.update().catch(err => {
            console.error(`Calendar update errored:\n${err.stack}`);
        });

        console.log(`Logging in to Discord.`);
        await this.login(this._options.token);
        this.invite = await this.generateInvite();
        console.log(`Successfully logged in as ${this.user.tag}, invite: ${this.invite}`);
        this.prefix = this._options.prefix;
        // this.calendar.post();
        // this.calendar._oneHourReminder(this.calendar.eventsToday[0]);
        // this.calendar._eventStart(this.calendar.eventsToday[0]);

        this.scheduleJobs();

    }

    scheduleJobs() {

        scheduler.scheduleJob(this._options.updateCalendarCron, this.calendar.update.bind(this.calendar));
        scheduler.scheduleJob(this._options.postEventsCron, this.calendar.post.bind(this.calendar));

    }

    set prefix(param) {

        /**
         * @private
         */
        this._prefix = [param, `<@!?${this.user.id}> ?`];
    }

    get prefix() {
        return this._prefix[0];
    }

}

module.exports = CalendarBot;