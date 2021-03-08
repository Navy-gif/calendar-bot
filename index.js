const Client = require('./structure/client/Client.js');
const CONFIG = require('./config.json');

const client = new Client(CONFIG);
client.init();