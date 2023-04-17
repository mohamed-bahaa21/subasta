// GET /api/public/generals
const express = require("express");
const router = express.Router();
// Controller
const { getAllDeals, getDealById } = require('@controllers/public/deals.public.controller')
// Validator
const { ParamsValidation, QueryValidation } = require("@validators/index.validator");
const validationSchemes = require('@validators/public.validators')

// GET deals (Filter, sort, pagination, and search)
router.get("/all", getAllDeals);
// GET deal by id (deal detail page)
router.get("/id/:id", QueryValidation(validationSchemes.dealsValidationSchemas["/id/:id"]), getDealById);


module.exports = router;