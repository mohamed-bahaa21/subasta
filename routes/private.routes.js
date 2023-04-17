// /api/private/
const express = require('express');
const router = express.Router();

const auctions = require('./private/auctions.private.routes');
const user = require('./private/user.private.routes');
const order = require('./private/orders.private.routes');
const cart = require('./private/cart.private.routes');

router.use('/auctions', auctions);
router.use("/user", user);
router.use("/order", order);
router.use("/cart", cart);

module.exports = router;
