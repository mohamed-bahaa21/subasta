const express = require('express');
const router = express.Router();
// Models
const Cart = require('@models/Cart.model');
// Validators
const { ParamsBodyValidation, QueryValidation, ParamsValidation } = require("@validators/index.validator");
const validationSchemes = require('@validators/admin.validator')
// Middlewares
const { authenticateAdmin } = require("@middlewares/auth.rest.middleware");

// GET /api/carts?filter=value&sort=value&page=value&search=value
router.get('/',
    QueryValidation(validationSchemes.cartValidationSchemas['/'].get),
    authenticateAdmin, async (req, res) => {
        try {
            const { filter, sort, page, search } = req.query;
            const limit = 10;
            const skip = (page - 1) * limit;
            const query = {};

            if (filter) {
                query.filterField = filter;
            }

            if (search) {
                query.searchField = new RegExp(search, 'i');
            }

            const carts = await Cart.find(query)
                .sort(sort)
                .skip(skip)
                .limit(limit);

            res.status(200).json({ carts });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

// GET /api/carts/:id
router.get('/:id',
    ParamsValidation(validationSchemes.cartValidationSchemas['/:id'].get),
    authenticateAdmin, async (req, res) => {
        try {
            const { id } = req.params;
            const cart = await Cart.findById(id);

            if (!cart) {
                return res.status(404).json({ message: 'Cart not found' });
            }

            res.status(200).json({ cart });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

// PUT /api/carts/:id
router.put('/:id',
    ParamsBodyValidation(validationSchemes.cartValidationSchemas['/:id'].put),
    authenticateAdmin, async (req, res) => {
        try {
            const { id } = req.params;
            const cart = await Cart.findById(id);
            if (!cart) return res.status(404).json({ message: 'Cart not found' });

            const { products, totalPrice, totalItems, coupon } = req.body;
            if (totalPrice !== cart.totalPrice || totalItems !== cart.totalItems) {
                return res.status(400).json({ message: 'Invalid cart total data' });
            }

            cart.products = products || cart.products;
            cart.coupon = coupon !== undefined ? coupon : cart.coupon;
            cart.priceAfterCoupon = coupon !== null ? (totalPrice - (coupon.isPercent ? totalPrice * coupon.amount / 100 : coupon.amount)) : null;

            const updatedCart = await cart.save();

            res.status(200).json({ cart: updatedCart });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: error.message });
        }
    });

// DELETE /api/carts/:id
router.delete('/:id',
    ParamsValidation(validationSchemes.cartValidationSchemas['/:id'].delete),
    authenticateAdmin, async (req, res) => {
        try {
            const { id } = req.params;
            const cart = await Cart.findByIdAndDelete(id);

            if (!cart) {
                return res.status(404).json({ message: 'Cart not found' });
            }

            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

module.exports = router;