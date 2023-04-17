const express = require('express');
const router = express.Router();
// Controller
const {
    postCreateCharge,
    postConfirmPayment,
    getAuctionBids,
} = require('@controllers/private/auctions.private.controller');
// Validator
const { ParamsValidation, ParamsBodyValidation, QueryBodyValidation } = require("@validators/index.validator");
const validationSchemes = require('@validators/private.validators')

// POST confirm payment for the won auction or cancel the payment and pay cancelation fees
router.post('/charge', postCreateCharge);
router.post('/confirmPayment/:auctionId',
    QueryBodyValidation(validationSchemes.auctionValidationSchemas["/confirmPayment/:auctionId"]),
    postConfirmPayment
);
// GET auction bids on the auction details page
router.get('/auctionBids/:auctionId',
    ParamsValidation(validationSchemes.auctionValidationSchemas["/auctionBids/:auctionId"]),
    getAuctionBids
);


module.exports = router;