const {
    bucket,
    ANON_CARTS_FOLDER,
    ORDERS_FOLDER,
    USERS_FOLDER,
    PRODUCTS_FOLDER,
    PNG_IMAGE_EXTENSTION,
    FINAL_IMAGES_FOLDER,
    BUCKET_PATH,
    STORAGE_PATH,
} = require("../../../config/googlecloud.config");
const _ = require("lodash");

async function copyImagesFromProductToCartAndRepalceSrc(
    cartObj,
    partialNewPath
) {
    // will loop over the combinations, and find if there is isDesigned = flase.
    // if I find one, I will copy the files from product location, to the new path directly.
    // will replace the src url here directly since will be one image only, the front image (main).

    // the new path will be until the order id. Need to add combination id folder.
    // then image location then extensiton.

    await Promise.all(
        cartObj.combinations.map(async (combination) => {
            if (!combination.isDesigned) {
                // copy the product image to the new path.
                let productImageObj = _.cloneDeep(combination.finalImages[0]);

                // get the file name from the existent image src.
                let oldPrefix = productImageObj.src.replace(
                    STORAGE_PATH + BUCKET_PATH,
                    ""
                );

                // parial path is only until orderId.
                let newPath =
                    partialNewPath +
                    "/" +
                    combination.combinationId +
                    "/" +
                    FINAL_IMAGES_FOLDER +
                    productImageObj.location +
                    PNG_IMAGE_EXTENSTION;

                // reference the target file
                let file = bucket.file(oldPrefix);
                // copy to new path
                let [copiedFile] = await file.copy(newPath);

                // get the public url.
                let publicURL = copiedFile.publicUrl();

                // upadte the product iamge src
                productImageObj.src = publicURL;

                // update the combination final Iamges.
                combination.finalImages = [productImageObj];
            }
        })
    );

    return cartObj;
}

async function copyImagesFromCartToOrderAndUpdateTheCart(cartObj, orderId) {
    try {
        let cartId = cartObj._id;
        let userId = cartObj.userId;

        // the path of the cart
        let oldPrefix = ANON_CARTS_FOLDER + cartId;

        // new prefix is the path under users/orders/orderid
        let newPrefix = USERS_FOLDER + userId + "/" + ORDERS_FOLDER + orderId;

        let [allImages] = await bucket.getFiles({
            prefix: oldPrefix,
        });

        /////////////////////////////////////////////////////////
        // For generated combinations and designed products only.
        /////////////////////////////////////////////////////////

        // 2- copy files, this will trigger only generated images and attachments.
        // since the cart folder only will have images from designed combinations.

        await Promise.all(
            allImages.map(async (file) => {
                try {
                    let newfileName = file.name.replace(oldPrefix, newPrefix);

                    let [copiedFile] = await file.copy(newfileName);
                } catch (error) {
                    console.log("ERROR while copying file from cart to order");
                    return false;
                }
            })
        );

        // 3- update the cart images to the new path.
        let updatedCart = replaceImagesSrcToNewPath(cartObj, oldPrefix, newPrefix);

        ///////////////////////////////////////////////////////
        // For static combinations and not designable products.
        ///////////////////////////////////////////////////////

        // 4- copy images for static combinations, wasn't designed.
        // need to loop over the combinations, where isDesigned to false.
        // if I find one, need to copy it from product/productId/keyOfTheImage.png
        // to the new path directly to be with the other images.

        let updatedCartWithCopiedProductImages =
            await copyImagesFromProductToCartAndRepalceSrc(updatedCart, newPrefix);

        return updatedCartWithCopiedProductImages;
    } catch (error) {
        console.log("ERROR in the copy files function, general catch", error);
    }
}

module.exports = copyImagesFromCartToOrderAndUpdateTheCart;
