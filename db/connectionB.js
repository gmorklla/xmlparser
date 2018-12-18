const mongoose = require('mongoose');
const url = require('../config/config').db;

mongoose.connect(url, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
});

module.exports = mongoose.connection;
