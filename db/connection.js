const mongoose = require('mongoose');
const url = require('../config/config').db;
const logger = require('../utilities/logger');

module.exports = {
    connect: async () => {
        try {
            return await mongoose.connect(url, {
                useNewUrlParser: true,
                useCreateIndex: true,
                useFindAndModify: false
            });
        } catch (error) {
            logger.error({
                message: `Connecting to db`,
                error: error.message
            });
        }
    },
    disconnect: async () => await mongoose.connection.close()
}
