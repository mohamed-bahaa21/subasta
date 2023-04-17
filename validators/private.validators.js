const Joi = require('joi');


const userValidationSchemas = {
    '/createOrLoadProfile': {
        body: Joi.object({
            firebaseId: Joi.string().required(),
            displayName: Joi.string().required(),
            firstName: Joi.string().required(),
            lastName: Joi.string().required(),
            email: Joi.string().email().required(),
            phoneNumber: Joi.string().required(),
            photoURL: Joi.string().required(),
            accountType: Joi.string().valid('individual', 'company', null).default(null),
            companyName: Joi.when('accountType', { is: 'company', then: Joi.string().required() }),
        }),
    },
    '/myProfile': {
        headers: Joi.object({
            authorization: Joi.string().required(),
        }).unknown(),
    },
    '/updatePersonalInfo': {
        headers: Joi.object({
            authorization: Joi.string().required(),
        }).unknown(),
        body: Joi.object({
            email: Joi.string().email().required(),
        }),
    },
    '/updateOnboardingInfo': {
        headers: Joi.object({
            authorization: Joi.string().required(),
        }).unknown(),
        body: Joi.object({
            primaryAddress: Joi.object({
                street: Joi.string().required(),
                city: Joi.string().required(),
                state: Joi.string().required(),
                country: Joi.string().required(),
                zipCode: Joi.string().required(),
            }),
            primaryCreditCard: Joi.object({
                cardNumber: Joi.string().creditCard().required(),
                expirationMonth: Joi.string().required(),
                expirationYear: Joi.string().required(),
                cvc: Joi.string().required(),
            }),
        }),
    },
    '/updateAddresses': {
        headers: Joi.object({
            authorization: Joi.string().required(),
        }).unknown(),
        body: Joi.object({
            addresses: Joi.array().items({
                street: Joi.string().required(),
                city: Joi.string().required(),
                state: Joi.string().required(),
                country: Joi.string().required(),
                zipCode: Joi.string().required(),
                isDefault: Joi.boolean(),
            }).min(1).required(),
        }),
    },
    '/updatePaymentMethods': {
        headers: Joi.object({
            authorization: Joi.string().required(),
        }).unknown(),
        body: Joi.object({
            paymentMethods: Joi.array().items({
                cardNumber: Joi.string().creditCard().required(),
                expirationMonth: Joi.string().required(),
                expirationYear: Joi.string().required(),
                cvc: Joi.string().required(),
                isDefault: Joi.boolean(),
            }).min(1).required(),
        }),
    },
    '/favoriteAuctions': {
        headers: Joi.object({
            authorization: Joi.string().required(),
        }).unknown(),
    },
    '/updateFavoriteAuctions': {
        headers: Joi.object({
            authorization: Joi.string().required(),
        }).unknown(),
        body: Joi.object({
            favoriteAuctions: Joi.array().items(Joi.string()).required(),
        }),
    },
    '/biddingHistory': {
        headers: Joi.object({
            authorization: Joi.string().required(),
        }).unknown(),
    },
    '/ordersHistory': {
        headers: Joi.object({
            authorization: Joi.string().required(),
        }).unknown(),
    },
};

const cartsValidationSchemas = {
    '/:userId': {
        params: Joi.object({
            userId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                'string.pattern.base': 'Invalid ID format',
                'any.required': 'ID is required',
            }),
        }),
        body: Joi.object({
            productId: Joi.string().required(),
            quantity: Joi.number().required().min(1),
        })
    }
};

const auctionValidationSchemas = {
    '/confirmPayment/:auctionId': {
        params: Joi.object({
            auctionId: Joi.string().required(),
        }),
        body: Joi.object({
            paymentProofUrl: Joi.string().required(),
        }),
    }
};

const validationSchemes = {
    cartsValidationSchemas,
    userValidationSchemas,
    auctionValidationSchemas
}

module.exports = validationSchemes