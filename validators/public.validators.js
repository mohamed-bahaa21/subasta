const Joi = require('joi');

const auctionsValidationSchemas = {
    '/running': {
        params: Joi.object({
            filter: Joi.string(),
            sort: Joi.string(),
            page: Joi.number().integer().min(1),
            limit: Joi.number().integer().min(1).max(100),
            q: Joi.string(),
            auction_status: Joi.string().valid('open', 'closed', 'ongoing', 'won')
        })
    },
    '/upcoming': {
        params: Joi.object({
            lang: Joi.string().valid('en', 'es', 'er', 'fr').required(),
        })
    },
    '/id/:id': {
        query: Joi.object({
            id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                'string.pattern.base': 'Invalid ID format',
                'any.required': 'ID is required',
            }),
        })
    },
};

const searchValidationSchema = {
    '/auctions': {
        query: Joi.object({
            q: Joi.string().optional(),
            status: Joi.string().valid('ongoing', 'completed').optional(),
            keyword: Joi.string().optional(),
            category: Joi.string().optional(),
            start: Joi.date().iso().optional(),
            end: Joi.date().iso().optional(),
        })
    }
}

const generalsValidationSchemas = {
    '/:lang/:page': {
        query: Joi.object({
            lang: Joi.string().valid('en', 'es', 'er', 'fr').required(),
            page: Joi.string().required(),
        })
    },
    '/:lang/faq': {
        query: Joi.object({
            lang: Joi.string().valid('en', 'es', 'er', 'fr').required(),
        })
    },
    '/contact-us': {
        body: Joi.object({
            name: Joi.string().trim().required(),
            email: Joi.string().email().trim().required(),
            phone: Joi.string().trim().pattern(/^\+?\d{10,14}$/).required(),
            message: Joi.string().trim().required(),
        })
    }
};

const dealsValidationSchemas = {
    '/id/:id': {
        query: Joi.object({
            id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                'string.pattern.base': 'Invalid ID format',
                'any.required': 'ID is required',
            }),
        })
    },
}


const validationSchemes = {
    auctionsValidationSchemas,
    searchValidationSchema,
    generalsValidationSchemas,
    dealsValidationSchemas
}

module.exports = validationSchemes