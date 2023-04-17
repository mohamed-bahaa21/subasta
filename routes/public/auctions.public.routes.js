// GET /api/public/auctions
const express = require("express");
const router = express.Router();
// Controller
const { getAuctionsQuery, getAuctionById, getUpcomingAuctions } = require('@controllers/public/auctions.public.controller');
// Validatior
const { ParamsValidation, QueryValidation } = require("@validators/index.validator");
const validationSchemes = require('@validators/public.validators')

// GET running auctions (Filter, sort, pagination, and search)
router.get("/running", ParamsValidation(validationSchemes.auctionsValidationSchemas["/running"]), getAuctionsQuery);
// GET upcoming auctions (Filter, sort, pagination, and search)
router.get("/upcoming", ParamsValidation(validationSchemes.auctionsValidationSchemas['/upcoming']), getAuctionsQuery);
// GET auction by id (auction detail page)
router.get("/id/:id", QueryValidation(validationSchemes.auctionsValidationSchemas["/id/:id"]), getAuctionById);

// ===========================================================================

// POST /api/public/auctions/category
// router.post("/category-auctions", postCategoryAuctions);
// router.post("/search-auctions", postSearchAuctions);



module.exports = router;
