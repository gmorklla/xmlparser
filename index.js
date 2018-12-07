const cron = require('node-cron');
const {
  getFiles
} = require('./utilities/general');
const saveXmlFile = require('./utilities/xmlSpecific');
const {
  connect,
  disconnect
} = require('./db/connection');
const {
  colorIt
} = require('./utilities/general');
const {
  getNewFiles,
  removeFiles
} = require('./retreiver');

const interval = require('./config/config').interval;

cron.schedule(interval, () => {
  connectToDBAndSave();
});

function connectToDBAndSave() {
  const files = getNewFiles();
  const date = new Date();
  console.log(`Total number of files arrived up until ${date.toTimeString()}: ${files.length}`);
  if (files.length > 0) {
    files.forEach(file => {
      console.log('Process', file);
      saveXmlFile(file);
    });
    removeFiles();
    // connect()
    //   .then(() => {
    //     files.forEach(file => {
    //       console.log('Process', file);
    //       saveXmlFile(file);
    //     });
    //     removeFiles();
    //   })
    //   .catch(err => console.log(colorIt.red(err)));
  }
}
