const { findDealById, findAllDeals } = require("@services/first/public/deals.public.service");

async function getAllDeals(req, res, next) {
    try {
        let deals = await findAllDeals();
        return res.status(200).json(deals);
    } catch (error) {
        next(error)
    }
}
async function getDealById(req, res, next) {
    let id = req.params.id;
    try {
        let deal = await findDealById(id);
        return res.status(200).json(deal);
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getAllDeals,
    getDealById
}