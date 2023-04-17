let { findAllCategories } = require('@services/first/public/categories.public.service')

async function getAllCategories(req, res, next) {
    try {
        let categories = await findAllCategories();
        return res.status(200).json(categories);
    } catch (error) {
        next(error)
    }
}

module.exports = { getAllCategories }
