const { Client } = require('discord.js');
const { CommandHandler, Calendar } = require('./index.js');

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
            console.error(`Calendar update errored:\n${err}`);
        });

        console.log(`Logging in to Discord.`);
        await this.login(this._options.token);
        console.log(`Successfully logged in as ${this.user.tag}`);
        this.prefix = this._options.prefix;

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