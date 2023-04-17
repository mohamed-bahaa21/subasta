const {
    bucket,
    PNG_IMAGE_EXTENSTION,
    PRODUCTS_FOLDER,
    AUCTIONS_FOLDER,
    USERS_FOLDER,
    STORAGE_PATH,
    BUCKET_PATH,
} = require("./init");

const ShortUniqueId = require("short-unique-id");
const _ = require("lodash");

const resizeImage = require("../imageProcessing/resizeImage");
const {
    checkIsBase64AndNotUrl,
} = require("../imageProcessing/imageBase46Utils");

const uid = new ShortUniqueId({ length: 36 });

const imageUID = new ShortUniqueId({ length: 6, dictionary: "number" });

const preDefinedOptions = {
    contentType: "image/png",
    //   public: true,
    metadata: {
        cacheControl: "public,max-age=31556926,immutable",
        metadata: {
            // custom metaData must be in own object like this

            // this key is needed so the images can load correctly in firebase console.
            firebaseStorageDownloadTokens: uid(),
        },
    },
};

/**
 *
 * @param {string} folderId auctionId, productId, userId
 * @param {[string]} imagesArray can be mixed of base64 or URLs
 * @param {string} type String of "product", "user", "auction"
 * @returns {*} Return the new uploaded images array.
 */
async function resizeAndUploadImagesToStorage(
    folderId, // auctions, prodcuts, users
    imagesArray, // in base64 or URL mixed. Function will handle detection.
    type // product, user, auction
) {
    try {
        let newImagesArray = [];

        await Promise.all(
            imagesArray.map(async (imgSrc) => {
                // check is base64 before uploading.
                // if is URL, means already uploaded, so push to new array and return.

                let isBase64 = checkIsBase64AndNotUrl(imgSrc);

                if (!isBase64) {
                    // push imgObj as it is and return from this cycle of loop.
                    newImagesArray.push(imgSrc);
                    return;
                }

                // 1- convert to buffer

                let resizedImgInBuffer = await resizeImage(
                    imgSrc,
                    1000,
                    1000,
                    false,
                    false
                );

                let fileName;
                let imgName = imageUID();

                if (type === "auction") {
                    fileName =
                        // AUCTIONS_FOLDER + folderId + "/" + imgName + PNG_IMAGE_EXTENSTION;
                        fileName = `${AUCTIONS_FOLDER}${folderId}/${imgName}${PNG_IMAGE_EXTENSTION}`;
                } else if (type === "product") {
                    // 2- for products
                    fileName =
                        PRODUCTS_FOLDER + folderId + "/" + imgName + PNG_IMAGE_EXTENSTION;
                } else if (type === "user") {
                    // for users
                    fileName =
                        USERS_FOLDER + folderId + "/" + imgName + PNG_IMAGE_EXTENSTION;
                } else {
                    return false;
                }

                // will not use this one, it is url encoded.
                let imgPublicURL = await uploadImageToStorage(
                    resizedImgInBuffer,
                    fileName
                );

                if (!imgPublicURL) throw Error("Could not upload image " + fileName);

                let imgFinalSrc = STORAGE_PATH + BUCKET_PATH + fileName;

                // push object to the new images array.
                newImagesArray.push(imgFinalSrc);
            })
        );

        return newImagesArray;
    } catch (error) {
        console.log(error);
        return false;
    }
}

async function uploadImageToStorage(imageBuffer, fileNameWithFullPath) {
    try {
        let file = bucket.file(fileNameWithFullPath);
        // push buffer to the storage.
        await file.save(imageBuffer, preDefinedOptions);
        // get public url
        let publicURL = file.publicUrl();

        return publicURL;
    } catch (error) {
        console.log(error);
        return null;
    }
}

module.exports = {
    resizeAndUploadImagesToStorage,
};
