// /api/admin/
const express = require('express');
const router = express.Router();

const auctions = require('./admin/auctions.admin.routes');
const users = require('./admin/users.admin.routes');
const cart = require('./admin/cart.admin.routes');
const order = require('./admin/order.admin.routes');
const categories = require('./admin/categories.admin.routes');

router.use('/auctions', auctions);
router.use('/user', users);
router.use('/cart', cart);
router.use('/categories', categories);

module.exports = router;
