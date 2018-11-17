const {
  getFiles
} = require('./utilities/general');
const directoryXml = require('./utilities/xmlSpecific');
const {
  dbConnection,
  emitter
} = require('./db/connection');
const {
  colorIt
} = require('./utilities/general');

const mainPath = './data';
dbConnection();

emitter.on('connected', () => getFilesAndSaveXmlData());


function getFilesAndSaveXmlData() {
  console.log(colorIt.cyan('Starting process...'));
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
