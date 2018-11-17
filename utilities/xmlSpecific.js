const fs = require('fs');
const util = require('util');
const XmlStream = require('xml-stream');
const {
    getFiles,
    createJSON
} = require('./general');
const {
    format,
    getTick
} = require('./formatDate');
const First = require('../db/models/firstA');
// Function(file:string):null to read xml file w/XmlStream : null
function readXmlFile(file) {
    const stream = fs.createReadStream(file);
    const xml = new XmlStream(stream);
    let nedn = '';
    let cbt = '';
    xml.on('endElement: nedn', item => nedn = item['$text']);
    xml.on('endElement: cbt', item => cbt = item['$text']);
    xml.collect('mv');
    xml.on('endElement: mi', item => {
        const obj = {
            measurement: item.mt,
            nedn: nedn,
            cbt: format(cbt),
            events: [{
                mts: item.mts,
                mv: item.mv
            }]
        }
        console.log(util.inspect(obj));
    });
}
let docs = [];
let amount = 0;

function saveXmlFile(file) {
    const stream = fs.createReadStream(file);
    const xml = new XmlStream(stream);
    let nedn = '';
    let cbt = '';
    let mt = '';
    let mts = '';
    xml.on('endElement: nedn', item => nedn = item['$text']);
    xml.on('endElement: cbt', item => cbt = item['$text']);
    xml.on('endElement: mt', item => mt = item['$text']);
    xml.on('endElement: mts', item => mts = getTick(item['$text']));
    xml.on('endElement: mv', item => {
        const iDay = format(cbt);
        const {
            moid,
            r
        } = item;
        const step = 'values.' + mts;
        const obj = {};
        obj[step] = r;
        const toPush = {
            updateOne: {
                "filter": {
                    measurement: mt,
                    nedn: nedn,
                    moid: moid,
                    day: iDay
                },
                "update": {
                    $set: obj
                },
                "upsert": true
            }
        };
        docs.push(toPush);
        amount++;
        if (amount % 100 === 0) {
            xml.pause();
            First.bulkWrite(docs, (err, res) => {
                if (err) {
                    console.log(util.inspect(err.op));
                }
                docs = [];
                xml.resume();
            });
        }
    });
}
// Function(path:string):null to get files from directory path and to read xml from them
function directoryXml(path) {
    // Get xml files from directory
    getFiles(path)
        // call readXmlFile() on each xml file found
        .then(items => items.forEach(file => saveXmlFile(path + file)))
        .catch(err => {
            throw err;
        });
}

module.exports = directoryXml;
