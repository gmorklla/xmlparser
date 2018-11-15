const mongoose = require('mongoose');
const chalk = require('chalk');
const dbURL = require('./property').db;
const events = require('events');
const eventEmitter = new events.EventEmitter();

const connected = chalk.bold.cyan;
const error = chalk.bold.yellow;
const disconnected = chalk.bold.red;
const termination = chalk.bold.magenta;

module.exports = {
    dbConnection: function () {

        mongoose.connect(dbURL, {
            useNewUrlParser: true
        });

        mongoose.connection.on('connected', function () {
            eventEmitter.emit('connected');
            console.log(connected("Mongoose default connection is open to ", dbURL));
        });

        mongoose.connection.on('error', function (err) {
            eventEmitter.emit('error');
            console.log(error("Mongoose default connection has occured " + err + " error"));
        });

        mongoose.connection.on('disconnected', function () {
            eventEmitter.emit('disconnected');
            console.log(disconnected("Mongoose default connection is disconnected"));
        });

        process.on('SIGINT', function () {
            mongoose.connection.close(function () {
                console.log(termination("Mongoose default connection is disconnected due to application termination"));
                process.exit(0)
            });
        });
    },
    emitter: eventEmitter
}
