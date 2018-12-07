const chokidar = require('chokidar');
const path = require('./config/config').path;

// Something to use when events are received.
const log = console.log.bind(console);
let files = [];

// Initialize watcher.
const watcher = chokidar.watch(path, {
    ignored: /(^|[\/\\])\../,
    persistent: true
});

// Add event listeners.
watcher
    .on('add', path => {
        log(`Files ${path} has been added`);
        files.push(path);
    })
    .on('change', path => log(`File ${path} has been changed`))
    .on('unlink', path => log(`File ${path} has been removed`));

const removeFiles = () => {
    files = [];
}

const getFiles = () => {
    return files;
}

module.exports = {
    getNewFiles: getFiles,
    removeFiles: removeFiles
};
