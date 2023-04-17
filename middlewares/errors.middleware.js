const REST_ERRORS = require('../errors/REST.errors')

const Logger = require('@services/third/winston/winston.service');
const logger = new Logger('errors.middleware');


function errorHandler(err, req, res, next) {
    if (err instanceof Error) {
        if (REST_ERRORS[err]) {

            logger.error(REST_ERRORS[err])
            res.status(err).json({ message: REST_ERRORS[err] });
        } else {
            res.status(err).json({ message: "Something went wrong, But couldn't find a customized message" });
        }
    } else {
        res.status(500).json({ message: "Something went wrong." });
    }
}

module.exports = { errorHandler }