// GET /api/public/categories
const express = require("express");
const router = express.Router();

const { getAllCategories } = require('@controllers/public/categories.public.controller')

// GET categories for the filter menus and the site menus.
router.get("/all", getAllCategories);

module.exports = router;
