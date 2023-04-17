const { Products } = require("@models/Product.model");

async function findAllDeals() {
    try {
        let deals = await Products.find({ hasDeal: true });
        // let deals = await Deals.find();
        return deals
    } catch (error) {
        throw new Error(610)
    }
}
async function findDealById(id) {
    try {
        let deal = await Products.find({ hasDeal: true, _id: id });
        // let deal = await Deals.findOneById(id);
        return deal
    } catch (error) {
        throw new Error(611)
    }
}

module.exports = {
    findAllDeals,
    findDealById
}