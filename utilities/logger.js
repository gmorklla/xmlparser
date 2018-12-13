const {
    createLogger,
    format,
    transports
} = require('winston');
const {
    combine,
    timestamp,
    colorize,
    prettyPrint,
    printf,
    json
} = format;
const path = require('path');
const lPath = '../logs/log.json';

const custom = printf(info => {
    const date = new Date(info.timestamp);
    return `${info.level} ${info.message} ${date.toLocaleString()} ${info.data ? "[" + info.data + "]" : "[ ]"}`;
});

const options = {
    file: {
        level: 'info',
        filename: path.join(__dirname, lPath),
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        format: combine(
            timestamp(),
            json({
                space: 2
            })
        )
    },
    console: {
        level: 'debug',
        handleExceptions: true,
        format: combine(
            format(info => {
                info.level = '[' + info.level.toUpperCase() + ']'
                return info;
            })(),
            timestamp(),
            colorize({
                all: true
            }),
            custom
        ),
    },
};

const logger = createLogger({
    transports: [
        new transports.File(options.file),
        new transports.Console(options.console)
    ],
    exitOnError: false, // do not exit on handled exceptions
});

module.exports = logger;
