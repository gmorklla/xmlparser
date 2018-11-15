const {
  getFiles,
  directoryXml
} = require('./utilities/general');
const {
  dbConnection,
  emitter
} = require('./db/connection');

const mainPath = './data';
dbConnection();

emitter.on('connected', () => startProcess());


function startProcess() {
  // Get directories from mainPath
  getFiles(mainPath)
    // filter name directories that begin with a dot
    .then(items => items.filter(item => /^[^.]/.test(item)))
    // map directories name to full path w/mainPath constant
    .then(directories =>
      directories.map(directory => mainPath + '/' + directory + '/')
    )
    // call directoryXml() on each passed directory
    .then(paths => paths.forEach(path => directoryXml(path)))
    .catch(error => {
      throw error;
    });
}
