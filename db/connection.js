const mongoose = require('mongoose');
const dbURL = require('./property').db;
const events = require('events');
const eventEmitter = new events.EventEmitter();
const {
    colorIt
} = require('../utilities/general');

module.exports = {
    dbConnection: function () {

        mongoose.connect(dbURL, {
            useNewUrlParser: true
        });

        mongoose.connection.on('connected', function () {
            console.log(colorIt.cyan("Mongoose default connection is open to ", dbURL));
            eventEmitter.emit('connected');
        });

        mongoose.connection.on('error', function (err) {
            console.log(colorIt.yellow("Mongoose default connection has occured " + err + " error"));
            eventEmitter.emit('error');
        });

        mongoose.connection.on('disconnected', function () {
            console.log(colorIt.red("Mongoose default connection is disconnected"));
            eventEmitter.emit('disconnected');
        });

        process.on('SIGINT', function () {
            mongoose.connection.close(function () {
                console.log(colorIt.magenta("Mongoose default connection is disconnected due to application termination"));
                process.exit(0)
            });
        });
    },
    emitter: eventEmitter
}
