const mongoose = require('mongoose');
const url = require('../config/config').db;

module.exports = {
    connect: async () => await mongoose.connect(url, {
        useNewUrlParser: true
    }),
    disconnect: async () => await mongoose.connection.close()
}
