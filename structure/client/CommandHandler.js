class CommandHandler {

    constructor(client) {

        this.client = client;

    }

    async init() {

        this.client.on('message', this.handle.bind(this));

    }

    async handle(message) {

        //console.log(message);
        
    }

}

module.exports = CommandHandler;