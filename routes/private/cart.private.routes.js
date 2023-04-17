// GET /api/private/cart
const express = require("express");
const router = express.Router();
// Controller
const {
    getCartByUserId, updateCartByUserId
} = require('@controllers/private/cart.private.controller');
// Validatior
const { ParamsValidation, ParamsBodyValidation } = require("@validators/index.validator");
const validationSchemes = require('@validators/private.validators')

// GET fetch user cart by userId (UID from firebase.)
router.get("/:userId",
    ParamsValidation(validationSchemes.cartsValidationSchemas["/:userId"]),
    getCartByUserId
);

// PUT add the product to the cart, change its quantity, or remove it.
router.put("/:userId",
    ParamsBodyValidation(validationSchemes.cartsValidationSchemas["/:userId"]),
    updateCartByUserId
);

// ===========================================================================

// POST /api/private/cart
// router.post("/category-auctions", postCategoryAuctions);
// router.post("/search-auctions", postSearchAuctions);



module.exports = router;
