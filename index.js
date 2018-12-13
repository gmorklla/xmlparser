const mongoose = require('mongoose');
const cron = require('node-cron');
const events = require('events');
const emitter = new events.EventEmitter();
const {
  getNewFiles,
  removeFile
} = require('./retreiver');
const interval = require('./config/config').interval;
const Files = require('./db/models/filesModel');
const {
  connect,
  disconnect
} = require('./db/connection');
const logger = require('./utilities/logger');
const request = require('request');

cron.schedule(interval, () => {
  getFilesAndProcess();
});

async function getFilesAndProcess() {
  const files = getNewFiles();
  const filteredFiles = await checkFilesInDb(files).then(filesNotInDb => filesNotInDb);
  logger.info({
    message: `New files`,
    data: filteredFiles.length.toString()
  });
  if (filteredFiles.length > 0) {
    await connect();
    console.log(`Checking connection ready state : ${mongoose.connection.readyState}`);
    filteredFiles.forEach(file => {
      logger.info({
        message: `Processing file start`,
        data: file
      });
      makeRequest(file);
    });
  }
}

async function checkFilesInDb(files) {
  try {
    const connection = mongoose.connection.readyState;
    if (connection !== 1) {
      await connect();
    }
    const filesInDb = await Files.findById('files');
    return !filesInDb ? files : files.filter(file => !filesInDb.list.includes(file));
  } catch (err) {
    handleError({
      message: `Checking files in db`,
      error: err.message
    });
  }
}

emitter.on('process end', val => {
  removeFile(val);
  logger.info({
    message: `Processing file end`,
    data: val
  });
});

function makeRequest(file) {
  const options = {
    method: 'GET',
    uri: 'http://localhost:3000/',
    qs: {
      file: file
    }
  }

  request(options, (err, res, body) => {
    if (err) {
      return console.log(err);
    }
    const resBody = JSON.parse(res.body);
    if (resBody.file) {
      emitter.emit('process end', resBody.file);
    }
  });
}

function handleError(obj) {
  logger.error(obj);
}
