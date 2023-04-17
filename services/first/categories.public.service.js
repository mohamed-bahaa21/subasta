const Category = require("@models/Category.model");

async function getAllCategories() {
    try {
        let categories = await Category.find();
        return categories
    } catch (error) {
        throw new Error(608)
    }
}

module.exports = { getAllCategories }