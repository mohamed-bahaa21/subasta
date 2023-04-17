// Import required packages and models
const express = require("express");
const stripe = require("stripe")(config.stripe.secretKey);
const { Order } = require("@models");

// Create the router object
const router = express.Router();

// Route for creating a new order
router.post("/", async (req, res) => {
    try {
        // Get the data from the request body
        const { items, shippingAddress, paymentMethod } = req.body;

        // Calculate the total price for the items
        const totalPrice = items.reduce((total, item) => total + item.price, 0);

        // Create a new Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: items.map((item) => ({
                name: item.name,
                description: item.description,
                amount: item.price * 100,
                currency: "usd",
                quantity: 1,
            })),
            shipping_address_collection: {
                allowed_countries: ["US", "CA"],
            },
            shipping_address: {
                line1: shippingAddress.address,
                city: shippingAddress.city,
                state: shippingAddress.state,
                postal_code: shippingAddress.zip,
                country: "US",
            },
            success_url: "https://example.com/success",
            cancel_url: "https://example.com/cancel",
        });

        // Save the new order to the database
        const order = new Order({
            items,
            totalPrice,
            shippingAddress,
            paymentMethod,
            checkoutSessionId: session.id,
        });
        await order.save();

        // Send the session ID back to the client
        res.json({ sessionId: session.id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Something went wrong" });
    }
});

// Route for updating an existing order
router.put("/:orderId", async (req, res) => {
    try {
        // Get the order ID from the request parameters
        const orderId = req.params.orderId;

        // Get the updated data from the request body
        const { items, shippingAddress, paymentMethod } = req.body;

        // Calculate the total price for the items
        const totalPrice = items.reduce((total, item) => total + item.price, 0);

        // Update the order in the database
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { items, totalPrice, shippingAddress, paymentMethod },
            { new: true }
        );

        // Send the updated order back to the client
        res.json(updatedOrder);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Something went wrong" });
    }
});

// Route for confirming a payment
router.post("/confirm-payment", async (req, res) => {
    try {
        // Get the Stripe Checkout Session ID from the request body
        const { sessionId } = req.body;

        // Retrieve the Checkout Session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        // If the payment was successful, update the order in the database
        if (session.payment_status === "paid") {
            const order = await Order.findOneAndUpdate(
                { checkoutSessionId: session.id },
                { paymentStatus: "paid" },
                { new: true }
            );

            // Send the updated order back to the client
            res.json(order);
        } else {
            // If the payment was not successful, return an error
            res.status