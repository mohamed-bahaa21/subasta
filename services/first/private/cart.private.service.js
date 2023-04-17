const Cart = require("@models/Cart.model");

async function findCartByUserId(userId) {
    try {
        let cart = Cart.findOne({ userId: userId })
        return cart
    } catch (error) {
        throw new Error()
    }
}

async function updateProductInCart(cartId, productId, quantity) {
    try {
        const cart = await Cart.findOne({ _id: cartId });
        if (!cart) return new Error();

        // check if product is already in the cart
        // returns undefined or product object
        const existingProduct = cart.products.find((product) => product.productId.toString() === productId);

        // if product already exists, update its quantity
        if (existingProduct) {
            if (quantity > 0) {
                existingProduct.quantity = quantity;

                const updatedCart = await Cart.updateOne(
                    { _id: cartId },
                    { $set: { products: cart.products } }
                );

                return updatedCart;
            }

            // if the quantity is 0, delete the product from cart
            if (quantity === 0) {
                const updatedCart = await Cart.updateOne(
                    { _id: cartId },
                    { $pull: { products: { productId: productId } } }
                );

                // delete cart if this was the last product in cart
                if (cart.products.length === 1) {
                    let deleteCart = await Cart.deleteOne({ _id: cartId });
                    return deleteCart;
                } else {
                    return updatedCart;
                }
            }
        } else {
            // if product does not exist, add it to the cart
            cart.products.push({ productId, quantity });
        }

        // save the updated cart
        const updatedCart = await cart.save();
        return updatedCart;
    } catch (error) {
        throw new Error()
    }
}

module.exports = { updateProductInCart, findCartByUserId }