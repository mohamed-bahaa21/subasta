const mongoose = require('mongoose');

const Logger = require('@services/third/winston/winston.service');
const logger = new Logger('mongodb.config');

function configureMongoDB(options) {
    mongoose.connect(options)
        .then(() => {
            logger.info('Connected to MongoDB');
        })
        .catch(err => {
            logger.error('Error connecting to MongoDB:', err);
        });
};

module.exports = configureMongoDB;