function ParamsValidation(schema) {
    return (req, res, next) => {
        const { error, value } = schema.params.validate(req.params);
        if (error) return res.status(400).json({ message: error.details[0].message });

        req.params = value;
        next();
    };
}

function QueryValidation(schema) {
    return (req, res, next) => {
        const { error, value } = schema.query.validate(req.query);
        if (error) return res.status(400).json({ message: error.details[0].message });

        req.query = value;
        next();
    };
}

function BodyValidation(schema) {
    return (req, res, next) => {
        const { error, value } = schema.body.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        req.body = value;
        next();
    };
}

function ParamsBodyValidation(schema) {
    return (req, res, next) => {
        const { error, value } = Joi.concat(
            schema.params,
            schema.body
        ).validate({
            ...req.params,
            ...req.body,
        });

        if (error) {
            return res.status(400).json({
                message: error.details[0].message,
            });
        }

        req.params = value.params;
        req.body = value.body;
        next();
    };
}

function QueryBodyValidation(schema) {
    return (req, res, next) => {
        const { error, value } = Joi.concat(
            schema.query,
            schema.body
        ).validate({
            ...req.query,
            ...req.body,
        });

        if (error) {
            return res.status(400).json({
                message: error.details[0].message,
            });
        }

        req.query = value.query;
        req.body = value.body;
        next();
    };
}

function ParamsBodyFilesValidation(schema) {
    return (req, res, next) => {
        const { error, value } = Joi.object({
            ...schema.params,
            ...schema.body,
            files: schema.files,
        }).validate({
            ...req.params,
            ...req.body,
            files: req.files,
        });

        if (error) {
            return res.status(400).json({
                message: error.details[0].message,
            });
        }

        req.params = value.params;
        req.body = value.body;
        req.body.files = value.files;
        next();
    };
}

module.exports = { ParamsValidation, QueryValidation, BodyValidation, ParamsBodyValidation, QueryBodyValidation, ParamsBodyFilesValidation }