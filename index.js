const mongoose = require('mongoose');
const cron = require('node-cron');
const {
  getFiles,
  removeFile
} = require('./utilities/retreiver');
const interval = require('./config/config').interval;
const db = require('./db/connectionB');
const Files = require('./db/models/filesModel');
const logger = require('./utilities/logger');
const request = require('request');

// Cron schedule to call all parser process (get new file - parse xml file)
cron.schedule(interval, () => {
  getFilesAndProcess();
});

// Main process
async function getFilesAndProcess() {
  // Call to retreiver getFiles()
  const files = getFiles();
  // Filter files => Obtain only those that have not been processed
  const filteredFiles = await checkFilesInDb(files).then(filesNotInDb => filesNotInDb);
  // Log total number of new files
  logger.info({
    message: `New files`,
    data: filteredFiles.length.toString()
  });
  // If there are new files
  if (filteredFiles.length > 0) {
    // Process each new file
    filteredFiles.forEach(file => {
      // Log start of process
      logger.info({
        message: `Processing file start`,
        data: file
      });
      // Call function that will make the request to the server
      makeRequest(file)
        // After process finish ok, remove file from the retreiver list so is not process again
        .then(rFile => removeFileF(rFile))
        // Catch errors, log only those that are not logged on previous process
        .catch(err => {
          if (err) {
            logger.error({
              message: `On response from server`,
              data: file,
              error: err.message
            });
          }
        });
    });
  }
}

// Compare files to those saved on db (those that already were processed)
async function checkFilesInDb(files) {
  try {
    // Get files list from db
    const filesInDb = await Files.findById('files');
    // Filter
    return !filesInDb ? files : files.filter(file => !filesInDb.list.includes(file));
  } catch (err) {
    logger.error({
      message: `Checking files in db`,
      error: err.message
    });
  }
}

// Call removeFile from retreiver so it is not processed again
function removeFileF(val) {
  removeFile(val);
  // Log a process end
  logger.info({
    message: `Processing file end`,
    data: val
  });
};

// Make a request to server that will call the xml parse function
function makeRequest(file) {
  return new Promise((resolve, reject) => {
    // Options passed to request
    const options = {
      method: 'GET',
      uri: 'http://localhost:3000/parse',
      qs: {
        file: file
      }
    }
    // Simple request to server
    request(options, (err, res, body) => {
      if (err) {
        reject(err);
      };
      if (res) {
        const rBody = JSON.parse(res.body);
        // Result will be false if the function called from the service return an error
        // that error will be logged before, so here is not necessary
        if (!rBody.result) {
          reject(false);
        }
        // If there is not error, resolve
        resolve(rBody.file)
      } else {
        reject(false);
      }
    });
  });
}
