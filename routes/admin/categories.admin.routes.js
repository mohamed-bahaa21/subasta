const express = require('express');
const router = express.Router();
// Models
const Category = require('@models/Category.model');
// Validators
const { ParamsBodyValidation, QueryValidation, BodyValidation } = require("@validators/index.validator");
const validationSchemes = require('@validators/admin.validator')
// Middlewares
const { authenticateAdmin } = require('@middlewares/auth.rest.middleware');

// GET lists all categories (Filter, sort, pagination, and search).
router.get('/',
    QueryValidation(validationSchemes.categoryValidationSchemas['/'].get),
    authenticateAdmin, async (req, res) => {
        try {
            const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', q } = req.query;

            const filter = {};
            if (q) filter.$or = [{ name: { $regex: q, $options: 'i' } }, { slug: { $regex: q, $options: 'i' } }];

            const sort = {};
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

            const categories = await Category.find(filter)
                .sort(sort)
                .skip((+page - 1) * +limit)
                .limit(+limit);

            const count = await Category.countDocuments(filter);

            res.status(200).json({ categories, count });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

// GET category details.
router.get('/:categoryId',
    ParamsBodyValidation(validationSchemes.categoryValidationSchemas['/:categoryId'].get),
    authenticateAdmin, async (req, res) => {
        try {
            const { categoryId } = req.params;

            const category = await Category.findById(categoryId);
            if (!category) return res.status(404).json({ error: 'Category not found' });

            res.json({ category });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

// PUT update category details, translation, starting day, starting hour, ending day, ending hour, etc.
router.put("/:categoryId",
    ParamsBodyValidation(validationSchemes.categoryValidationSchemas['/:categoryId'].post),
    authenticateAdmin, async (req, res) => {
        try {
            const categoryId = req.params.categoryId;
            const category = await Category.findById(categoryId);

            if (!category) return res.status(404).json({ error: "Category not found" });

            category.name = req.body.name || category.name;
            category.slug = req.body.slug || category.slug;
            category.language = req.body.language || category.language;
            category.startTime = req.body.startTime || category.startTime;
            category.endTime = req.body.endTime || category.endTime;

            const updatedCategory = await category.save();

            res.json({ message: "Category updated successfully", category: updatedCategory });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });

// POST create a new category.
router.post('/',
    BodyValidation(validationSchemes.categoryValidationSchemas['/'].post),
    authenticateAdmin, async (req, res) => {
        try {
            const { error } = createCategorySchema.validate(req.body);
            if (error) return res.status(400).json({ error: error.details[0].message });

            const newCategory = new Category(req.body);
            const savedCategory = await newCategory.save();

            res.status(201).json({ message: 'Category created successfully', category: savedCategory });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

module.exports = router;