const fs = require('fs');
const path = require('path');
const XmlStream = require('xml-stream');
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
// Function(file:string):null to read xml file w/XmlStream : null
function readXmlFile(file) {
    const stream = fs.createReadStream(file);
    let xml = new XmlStream(stream);
    xml.collect('mv');
    xml.on('endElement: mi', item => {
        counter++;
        const rPath = '../files/mi' + counter + '.json';
        const name = path.join(__dirname, rPath);
        const obj = JSON.stringify(item);
        printTxt(name, obj);
    });
}
// Function(path:string):null to get files from directory path and to read xml from them
function directoryXml(path) {
    // Get xml files from directory
    getFiles(path)
        // call readXmlFile() on each xml file found
        .then(items => items.forEach(file => readXmlFile(path + file)))
        .catch(err => {
            throw err;
        });
}

module.exports = {
    getUsedMemory,
    printTxt,
    readXmlFile,
    getFiles,
    directoryXml
};
