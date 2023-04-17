const Joi = require('joi');

const categoryValidationSchemas = {
    '/': {
        get: {
            query: Joi.object({
                page: Joi.number().integer().min(1),
                limit: Joi.number().integer().min(1),
                sortBy: Joi.string(),
                sortOrder: Joi.string().valid('asc', 'desc'),
                q: Joi.string(),
            }),
        },
        post: {
            body: Joi.object({
                name: Joi.string().required(),
                slug: Joi.string().required(),
                language: Joi.string().valid('en', 'es', 'er', 'fr').required(),
                startTime: Joi.date().required(),
                endTime: Joi.date().required(),
            }),
        }
    },
    '/:categoryId': {
        get: {
            params: Joi.object({
                categoryId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                    'string.pattern.base': 'Invalid ID format',
                    'any.required': 'ID is required',
                }),
            }),
        },
        put: {
            params: Joi.object({
                categoryId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                    'string.pattern.base': 'Invalid ID format',
                    'any.required': 'ID is required',
                }),
            }),
            body: Joi.object({
                name: Joi.string().optional(),
                slug: Joi.string().optional(),
                language: Joi.string().valid('en', 'es', 'er', 'fr').optional(),
                startTime: Joi.date().optional(),
                endTime: Joi.date().optional(),
            }),
        },
    },
};

const userValidationSchemas = {
    '/': {
        query: Joi.object({
            search: Joi.string(),
            filter: Joi.object().or('displayName', 'email', 'accountType', 'isOnboarded', 'isBlocked').keys({
                displayName: Joi.string(),
                email: Joi.string(),
                accountType: Joi.string().valid('admin', 'user'),
                isOnboarded: Joi.boolean(),
                isBlocked: Joi.boolean(),
            }),
            sort: Joi.object({
                field: Joi.string().valid('createdAt', 'displayName', 'email'),
                order: Joi.string().valid('asc', 'desc'),
            }),
            page: Joi.number().integer().min(1),
            limit: Joi.number().integer().min(1),
        }),
    },
    '/:id': {
        get: {
            params: Joi.object({
                id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                    'string.pattern.base': 'Invalid ID format',
                    'any.required': 'ID is required',
                }),
            }),
        },
        put: {
            params: Joi.object({
                id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                    'string.pattern.base': 'Invalid ID format',
                    'any.required': 'ID is required',
                }),
            }),
            body: Joi.object({
                displayName: Joi.string().min(2).max(50),
                firstName: Joi.string().min(2).max(50),
                lastName: Joi.string().min(2).max(50),
                email: Joi.string().email(),
                phoneNumber: Joi.string().pattern(/^\+?\d{10,14}$/),
            }).min(1)
        },
        delete: {
            params: Joi.object({
                id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                    'string.pattern.base': 'Invalid ID format',
                    'any.required': 'ID is required',
                }),
            }),
        }
    }
}

const orderValidationSchemas = {
    "/": {
        get: {
            query: Joi.object({
                search: Joi.string(),
                filter: Joi.object().or('displayName', 'email', 'accountType', 'isOnboarded', 'isBlocked').keys({
                    displayName: Joi.string(),
                    email: Joi.string(),
                    accountType: Joi.string().valid('admin', 'user'),
                    isOnboarded: Joi.boolean(),
                    isBlocked: Joi.boolean(),
                }),
                sort: Joi.object({
                    field: Joi.string().valid('createdAt', 'displayName', 'email'),
                    order: Joi.string().valid('asc', 'desc'),
                }),
                page: Joi.number().integer().min(1),
                limit: Joi.number().integer().min(1),
            }),
        }
    },
    '/:id': {
        get: {
            params: Joi.object({
                id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                    'string.pattern.base': 'Invalid ID format',
                    'any.required': 'ID is required',
                }),
            }),
        },
        put: {
            params: Joi.object({
                id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                    'string.pattern.base': 'Invalid ID format',
                    'any.required': 'ID is required',
                }),
            }),
            body: Joi.object({
                address: Joi.object({
                    street: Joi.string().required(),
                    city: Joi.string().required(),
                    state: Joi.string().required(),
                    country: Joi.string().required(),
                    zipCode: Joi.string().required()
                }),
                status: Joi.string().valid('processing', 'shipped', 'delivered'),
                shippingMethod: Joi.string().valid('standard', 'express')
            }).min(1).required()
        },
        delete: {
            params: Joi.object({
                id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                    'string.pattern.base': 'Invalid ID format',
                    'any.required': 'ID is required',
                }),
            }),
        }
    },
    '/:id/refund': {
        params: Joi.object({
            id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                'string.pattern.base': 'Invalid ID format',
                'any.required': 'ID is required',
            }),
        }),
    }
}

const cartValidationSchemas = {
    '/': {
        get: {
            query: Joi.object({
                search: Joi.string(),
                filter: Joi.object().or('displayName', 'email', 'accountType', 'isOnboarded', 'isBlocked').keys({
                    displayName: Joi.string(),
                    email: Joi.string(),
                    accountType: Joi.string().valid('admin', 'user'),
                    isOnboarded: Joi.boolean(),
                    isBlocked: Joi.boolean(),
                }),
                sort: Joi.object({
                    field: Joi.string().valid('createdAt', 'displayName', 'email'),
                    order: Joi.string().valid('asc', 'desc'),
                }),
                page: Joi.number().integer().min(1),
                limit: Joi.number().integer().min(1),
            }),
        }
    },
    '/:id': {
        get: {
            params: Joi.object({
                id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                    'string.pattern.base': 'Invalid ID format',
                    'any.required': 'ID is required',
                }),
            }),
        },
        put: {
            params: Joi.object({
                id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                    'string.pattern.base': 'Invalid ID format',
                    'any.required': 'ID is required',
                }),
            }).required(),
            body: Joi.object({
                products: Joi.array().items(Joi.object({
                    productId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                        'string.pattern.base': 'Invalid ID format',
                        'any.required': 'ID is required',
                    }),
                    name: Joi.string().required(),
                    slug: Joi.string().allow(''),
                    unitPrice: Joi.number().min(0).required(),
                    quantity: Joi.number().integer().min(1).required(),
                    condition: Joi.string().allow(''),
                    packaging: Joi.string().allow(''),
                    dimensions: Joi.object({
                        width: Joi.number().min(0).required(),
                        height: Joi.number().min(0).required(),
                        length: Joi.number().min(0).required(),
                        weight: Joi.number().min(0).required(),
                    }).required(),
                    photoUrl: Joi.string().allow(''),
                    totalPrice: Joi.number().min(0).required(),
                })).optional(),
                totalPrice: Joi.number().min(0).required(),
                totalItems: Joi.number().integer().min(1).required(),
                coupon: Joi.object({
                    amount: Joi.number().min(0).required(),
                    isPercent: Joi.boolean().required(),
                    code: Joi.string().required(),
                }).allow(null).optional(),
            }).required(),
        },
        delete: {
            params: Joi.object({
                id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                    'string.pattern.base': 'Invalid ID format',
                    'any.required': 'ID is required',
                }),
            }).required(),
        }
    }
}

const auctionValidationSchemas = {
    '/': {
        get: {
            query: {
                page: Joi.number().integer().min(1),
                limit: Joi.number().integer().min(1).max(100),
                sort: Joi.string(),
                search: Joi.string(),
                filter: Joi.string(),
            },
        },
        post: {
            body: {
                name: Joi.string().required(),
                description: Joi.string().required(),
                supplierName: Joi.string().required(),
                startingDate: Joi.date().required(),
                endingDate: Joi.date().required(),
                startingPrice: Joi.number().min(0).required(),
                bidMinimumDifference: Joi.number().min(0).required(),
                handlingFee: Joi.number().min(0).required(),
                images: Joi.array().items(Joi.object({
                    originalname: Joi.string().required(),
                    buffer: Joi.required(),
                    mimetype: Joi.string().valid('image/png', 'image/jpeg', 'image/gif').required(),
                })).required(),
            },
        },
    },
    '/:id': {
        get: {
            params: {
                id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                    'string.pattern.base': 'Invalid ID format',
                    'any.required': 'ID is required',
                }),
            },
        },
        put: {
            params: {
                id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                    'string.pattern.base': 'Invalid ID format',
                    'any.required': 'ID is required',
                }),
            },
            body: {
                name: Joi.string(),
                description: Joi.string(),
                supplierName: Joi.string(),
                status: Joi.string(),
                statusMessage: Joi.string(),
                paymentStatus: Joi.string(),
                paymentMethod: Joi.string(),
                startingDate: Joi.date(),
                endingDate: Joi.date(),
                startingPrice: Joi.number().min(0),
                bidMinimumDifference: Joi.number().min(0),
                handlingFee: Joi.number().min(0),
                totalBids: Joi.number().integer().min(0),
                finalPrice: Joi.number().min(0),
            },
            files: {
                images: Joi.array().items(Joi.object({
                    originalname: Joi.string().required(),
                    buffer: Joi.required(),
                    mimetype: Joi.string().valid('image/png', 'image/jpeg', 'image/gif').required(),
                })),
            },
        },
    },
};

const validationSchemes = {
    categoryValidationSchemas,
    userValidationSchemas,
    orderValidationSchemas,
    cartValidationSchemas,
    auctionValidationSchemas
}

module.exports = validationSchemes