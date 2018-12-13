const fs = require('fs');
const mongoose = require('mongoose');
const XmlStream = require('xml-stream');
const {
  format,
  getTick
} = require('./formatDate');
const Parser = require('../db/models/parserModel');
const Files = require('../db/models/filesModel');
const {
  connect,
  disconnect
} = require('../db/connection');
const logger = require('./logger');

function saveXmlFile(file) {
  return new Promise((resolve, reject) => {
    let docs = [];
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
    xml.on('endElement: mv', async (item) => {
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
      if (docs.length % 100 === 0) {
        xml.pause();
        try {
          await save(docs);
          docs = [];
          xml.resume();
        } catch (err) {
          handleError({
            message: `Saving xml data`,
            data: file,
            error: err.message
          });
        }
      }
    });
    xml.on('end', _ => {
      handleEndEvent(docs, file)
        .then(val => {
          val ? resolve(true) : reject('Couldn\'t complete save xml file process');
        })
        .catch(err => {
          handleError({
            message: `Saving file name in db`,
            data: file,
            error: err.message
          });
          reject(err);
        })
    });
    xml.on('error', err => {
      handleError({
        message: `Saving xml data on error event`,
        data: file,
        error: err.message
      });
      reject(err);
    });
  });
}

async function saveFile(file) {
  const connection = mongoose.connection.readyState;
  if (connection !== 1) {
    await connect();
  }
  return Files.findOneAndUpdate({
    _id: 'files'
  }, {
    $push: {
      list: file
    }
  }, {
    new: true,
    upsert: true
  });
}

async function save(docs) {
  const connection = mongoose.connection.readyState;
  if (connection !== 1) {
    await connect();
  }
  return Parser.bulkWrite(docs);
}

async function handleEndEvent(docs, file) {
  try {
    if (docs.length > 0) {
      await save(docs);
      docs = [];
    }
    return await saveFile(file);
  } catch (err) {
    handleError({
      message: `Saving xml data on end event`,
      data: file,
      error: err.message
    });
  }
}

function handleError(obj) {
  logger.error(obj);
}

module.exports = saveXmlFile;
