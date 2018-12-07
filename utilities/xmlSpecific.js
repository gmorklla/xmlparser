const fs = require('fs');
const util = require('util');
const XmlStream = require('xml-stream');
const {
  getFiles
} = require('./general');
const {
  format,
  getTick
} = require('./formatDate');
const First = require('../db/models/firstA');
const {
  connect,
  disconnect
} = require('../db/connection');

function saveXmlFile(file) {
  let docs = [];
  let amount = 0;
  const stream = fs.createReadStream(file);
  const xml = new XmlStream(stream);
  let nedn = '';
  let cbt = '';
  let mt = '';
  let mts = '';
  xml.on('endElement: nedn', item => (nedn = item['$text']));
  xml.on('endElement: cbt', item => (cbt = item['$text']));
  xml.on('endElement: mt', item => (mt = item['$text']));
  xml.on('endElement: mts', item => (mts = getTick(item['$text'])));
  xml.on('endElement: mv', item => {
    const iDay = format(cbt);
    const {
      moid,
      r
    } = item;
    const step = "values." + mts[0] + "." + mts[1];
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
      connect()
        .then(() => {
          First.bulkWrite(docs, (err, res) => {
            if (err) {
              console.log(util.inspect(err.op));
            }
            docs = [];
            xml.resume();
            disconnect();
          });
        });
    }
  });
  xml.on('end', _ => {
    if (amount % 100 !== 0) {
      connect()
        .then(() => {
          First.bulkWrite(docs, (err, res) => {
            if (err) {
              console.log(util.inspect(err.op));
            }
            docs = [];
            console.log('bulkWrite on end finish');
            disconnect();
          });
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

module.exports = saveXmlFile;
