const Category = require("@models/Category.model");

async function findAllCategories() {
    try {
        let categories = await Category.find();
        return categories
    } catch (error) {
        throw new Error(608)
    }
}

module.exports = { findAllCategories }