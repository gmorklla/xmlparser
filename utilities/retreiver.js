const chokidar = require('chokidar');
const path = require('../config/config').path;
const logger = require('./logger');

let files = [];

// Initialize watcher.
const watcher = chokidar.watch(path, {
    ignored: /(^|[\/\\])\../,
    persistent: true
});

// Add event listeners.
watcher.on('add', path => files.push(path));
// .on('change', path => logger.info({
//     message: `Detected change on file`,
//     data: path
// }))
// .on('unlink', path => logger.info({
//     message: `Detected removed file`,
//     data: path
// }));

const removeFile = (file) => {
    let clone = [...files];
    clone = clone.filter(val => val !== file);
    files = clone;
}
const getFiles = () => files;

module.exports = {
    getFiles: getFiles,
    removeFile: removeFile
};
