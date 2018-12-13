const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Files Schema
const FilesSchema = new Schema({
    _id: String,
    list: [{
        type: String
    }],
});

// Files model
const Files = mongoose.model('Files', FilesSchema);

module.exports = Files;
