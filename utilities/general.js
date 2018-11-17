const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

let counter = 0;

// Function():null to log memoryUsage
function getUsedMemory() {
    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log(
        `The script uses approximately: ${Math.round(used * 100) / 100} MB`
    );
}
// Write file
function printTxt(name, obj) {
    const file = fs.createWriteStream(name);
    file.write(obj);
    file.end();
}
// Function(path:string):promise to get files on a path
function getFiles(path) {
    return new Promise((resolve, reject) => {
        fs.readdir(path, (err, items) => (err ? reject(err) : resolve(items)));
    });
}
//
function createJSON(item) {
    counter++;
    const rPath = '../files/mi' + counter + '.json';
    const name = path.join(__dirname, rPath);
    const obj = JSON.stringify(item);
    printTxt(name, obj);
}

module.exports = {
    getUsedMemory,
    printTxt,
    getFiles,
    createJSON,
    colorIt: {
        cyan: chalk.bold.cyan,
        yellow: chalk.bold.yellow,
        red: chalk.bold.red,
        magenta: chalk.bold.magenta
    }
};
