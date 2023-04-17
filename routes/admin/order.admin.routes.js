const express = require('express');
const router = express.Router();
const Order = require('@models/Order.model');
const stripe = require('stripe')('your_stripe_secret_key');
// Validators
const { ParamsBodyValidation, QueryValidation, ParamsValidation } = require("@validators/index.validator");
const validationSchemes = require('@validators/admin.validator')
// Middlewares
const { authenticateAdmin } = require("@middlewares/auth.rest.middleware");

// GET all orders (Filter, sort, pagination, and search)
router.get("/",
    QueryValidation(validationSchemes.orderValidationSchemas['/'].get),
    authenticateAdmin, async (req, res) => {
        const { status, search, sortBy, sortOrder, page, limit } = req.query;

        // Filter orders by status
        const filter = status ? { status } : {};

        // Search orders by publicId
        if (search) filter.publicId = { $regex: search, $options: "i" }; // CASE SENSitivity

        // Sort orders by field and order
        const sort = {};
        if (sortBy) {
            sort[sortBy] = sortOrder === "desc" ? -1 : 1;
        } else {
            sort.placedAt = -1; // default sort by placedAt in descending order
        }

        // Pagination
        const pageSize = limit ? parseInt(limit) : 10;
        const pageNumber = page ? parseInt(page) : 1;
        const skip = (pageNumber - 1) * pageSize;

        try {
            const orders = await Order.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(pageSize);

            const totalOrders = await Order.countDocuments(filter);

            res.json({
                data: orders,
                pagination: {
                    pageSize,
                    pageNumber,
                    totalPages: Math.ceil(totalOrders / pageSize),
                    totalOrders,
                },
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Internal server error." });
        }
    });

// GET /api/orders/:id
router.get('/:id',
    ParamsValidation(validationSchemes.orderValidationSchemas['/:id'].get),
    authenticateAdmin, async (req, res) => {
        try {
            const { id } = req.params;
            const order = await Order.findById(id);

            if (!order) return res.status(404).json({ message: 'Order not found' });

            res.status(200).json({ order });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

// PUT /api/orders/:id
router.put('/:id',
    ParamsBodyValidation(validationSchemes.orderValidationSchemas['/:id'].put),
    authenticateAdmin, async (req, res) => {
        try {
            const { id } = req.params;
            const { address, status, shippingMethod } = req.body;

            const order = await Order.findByIdAndUpdate(
                id,
                { address, status, shippingMethod },
                { new: true }
            );

            if (!order) return res.status(404).json({ message: 'Order not found' });

            res.status(200).json({ order });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

// DELETE /api/orders/:id
router.delete('/:id',
    ParamsValidation(validationSchemes.orderValidationSchemas['/:id'].delete),
    authenticateAdmin, async (req, res) => {
        try {
            const { id } = req.params;

            const order = await Order.findById(id);
            if (!order) return res.status(404).json({ message: 'Order not found' });
            if (order.status !== 'Pending') return res.status(400).json({ message: 'Order cannot be deleted' });

            // Delete the order
            await order.remove();

            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

// PUT /api/orders/:id/refund
router.put('/:id/refund',
    ParamsValidation(validationSchemes.orderValidationSchemas['/:id/refund'].put),
    authenticateAdmin, async (req, res) => {
        try {
            const { id } = req.params;

            const order = await Order.findById(id);
            if (!order) return res.status(404).json({ message: 'Order not found' });
            if (order.paymentStatus === 'Refunded') return res.status(400).json({ message: 'Payment has already been refunded' });

            // Refund the charge with Stripe API
            const refund = await stripe.refunds.create({
                charge: order.stripePaymentId,
                amount: order.total * 100, // Refund the full amount of the charge
            });

            // Update the order with the refund details
            order.paymentStatus = 'Refunded';
            order.refundId = refund.id;
            order.refundAmount = refund.amount / 100;
            await order.save();

            res.json({ message: 'Payment refunded successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

module.exports = router;