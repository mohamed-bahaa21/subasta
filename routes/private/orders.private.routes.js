const express = require('express');
const router = express.Router();
// Controller
// const {
//     confirmPayment,
//     getAuctionBids,
// } = require('@controllers/private/orders.private.controller');
// const {
//     createOrder,
//     updateOrder,
// } = require('@controllers/userController');
// Validatior
const { ParamsValidation, ParamsBodyValidation } = require("@validators/index.validator");
const validationSchemes = require('@validators/private.validators')

// Middleware to authenticate user's token
// const authenticateUser = require('@middlewares/authenticateUser');

router.post('/checkout', async (req, res) => {
    try {
        const { items, currency } = req.body;
        const amount = calculateTotalAmount(items);

        // Create the Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                name: 'Order Items',
                description: 'All the items in the order',
                amount: amount,
                currency: currency,
                quantity: 1
            }],
            success_url: 'https://example.com/success',
            cancel_url: 'https://example.com/cancel'
        });

        res.json({ sessionId: session.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

router.put('/:orderId', async (req, res) => {
    const { orderId } = req.params;
    const { cart, shippingAddress, paymentAddress, paymentMethod } = req.body;

    try {
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.cart = cart;
        order.shippingAddress = shippingAddress;
        order.paymentAddress = paymentAddress;
        order.paymentMethod = paymentMethod;
        await order.save();

        return res.json(order);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
});

function calculateTotalAmount(items) {
    let totalAmount = 0;
    for (let item of items) {
        totalAmount += item.price * item.quantity;
    }
    return totalAmount;
}




// TBD PART from the requirement doc file
// 1. Create a checkout session:
router.post('/checkout', async (req, res) => {
    const { cartItems, shippingAddress, billingAddress, paymentMethod } = req.body;
    const totalAmount = calculateTotalAmount(cartItems);

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: cartItems.map(item => {
            return {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item.name,
                        description: item.description,
                        images: [item.image],
                    },
                    unit_amount: item.price * 100, // amount in cents
                },
                quantity: item.quantity,
            };
        }),
        mode: 'payment',
        success_url: 'https://testing.com/success',
        cancel_url: 'https://testing.com/cancel',
    });

    // Save the checkout session ID to the database and send the session ID to the client
    const order = new Order({
        cartItems,
        shippingAddress,
        billingAddress,
        paymentMethod,
        totalAmount,
        checkoutSessionId: session.id,
    });

    await order.save();

    res.send({ sessionId: session.id });
});

// 2. Retrieve the checkout session:
router.get('/:sessionId', async (req, res) => {
    const { sessionId } = req.params;

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    res.send(session);
});

// 3. Confirm the payment:
router.put('/:orderId', async (req, res) => {
    const { orderId } = req.params;
    const { paymentIntentId } = req.body;

    const order = await Order.findById(orderId);

    // Confirm the payment with Stripe
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
    order.status = 'paid';
    await order.save();

    res.send({ message: 'Payment confirmed' });
});

module.exports = router;