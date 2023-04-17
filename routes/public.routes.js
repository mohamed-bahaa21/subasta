// /api/public/
const express = require('express');
const router = express.Router();

const auctions = require('./public/auctions.public.routes');
const generals = require('./public/generals.public.routes');
const categories = require('./public/categories.public.routes');
const deals = require('./public/deals.public.routes');
const search = require('./public/search.public.routes');

router.use('/auctions', auctions);
router.use('/generals', generals);
router.use('/categories', categories);
router.use("/deals", deals);
router.use("/search", search);

module.exports = router;
