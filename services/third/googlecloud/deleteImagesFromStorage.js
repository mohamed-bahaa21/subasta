const {
    bucket,
    USERS_FOLDER,
    ORDERS_FOLDER,
    AUCTIONS_FOLDER,
    STORAGE_PATH,
    BUCKET_PATH,
} = require("./init");

async function deleteOrderImagesFromStorage(orderId, userId) {
    try {
        let prefix = USERS_FOLDER + userId + "/" + ORDERS_FOLDER + orderId;

        await bucket.deleteFiles({
            prefix: prefix,
            force: true,
        });

        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

async function deleteAllAuctionImagesFromStorage(auctionId) {
    try {
        let prefix = AUCTIONS_FOLDER + auctionId;

        await bucket.deleteFiles({
            prefix: prefix,
            force: true,
        });

        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

async function deleteImagesByURL(imagesToDelete) {
    try {
        await Promise.all(
            imagesToDelete.map(async (imgString) => {
                let prefix = imgString.replace(STORAGE_PATH + BUCKET_PATH, "");
                // delete
                await bucket.deleteFiles({
                    prefix: prefix,
                    force: true,
                });
            })
        );

        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

module.exports = {
    deleteOrderImagesFromStorage,
    deleteAllAuctionImagesFromStorage,
    deleteOrderImagesFromStorage,
    deleteImagesByURL,
};
