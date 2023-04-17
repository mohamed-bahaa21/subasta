// GET /api/public/search
const express = require('express');
const router = express.Router();
// Controller
const { searchAuctions } = require('@controllers/public/search.public.controller');
// Validatior
const { ParamsValidation, QueryValidation } = require("@validators/index.validator");
const validationSchemes = require('@validators/public.validators')

// auctions ongoing:                /api/public/search/auctions ?status=running
// auctions completed:              /api/public/search/auctions ?status=ended
// auctions keywords:               /api/public/search/auctions ?keywords=car
// auctions category:               /api/public/search/auctions ?category=electronics
// auctions start/end time:         /api/public/search/auctions ?startTime=2023-03-01T00:00:00.000Z&endTime=2023-03-31T00:00:00.000Z
// auctions multiple parameters:    /api/public/search/auctions ?status=running&keywords=car&category=electronics&startTime=2023-03-01T00:00:00.000Z&endTime=2023-03-31T00:00:00.000Z
router.get('/auctions', QueryValidation(validationSchemes.searchValidationSchema['/auctions']), searchAuctions);

module.exports = router;