let { findCartByUserId, updateProductInCart } = require('@services/first/private/cart.private.service')

async function getCartByUserId(req, res, next) {
    let { userId } = req.body;
    try {
        let cart = await findCartByUserId(userId);
        return res.status(200).json(cart);
    } catch (error) {
        next(error)
    }
};

// let { userId, cartDetails } = req.body;
// try {
//     let cart = await findCartByUserId(userId);

//     return res.status(200).json(updateCart);
// } catch (error) {
//     next(error)
// }

async function updateCartByUserId(req, res, next) {
    const userId = req.params.userId;
    const productId = req.body.productId;
    const quantity = req.body.quantity;

    // get user's cart
    let cart = await findCartByUserId(userId);
    // let updateCart = await updateProductInCart(cart._id, ...cartDetails)
    let updatedCart = await updateProductInCart(cart._id, productId, quantity)

    res.status(200).json(updatedCart);
}

module.exports = { getCartByUserId, updateCartByUserId }