const sharp = require("sharp");

const {
    convertBase64ToBuffer,
    convertBufferToBase64,
} = require("./imageBase46Utils");

const resizeImage = async (
    originalImageInBase64, // with or without prefix.
    newWidth,
    newHeight,
    toBase64 = true,
    base64WithPrefix = true
) => {
    // take original image and resize it
    // if base64 is true then convert to base46 then return the string.

    try {
        let bufferFromBase64 = convertBase64ToBuffer(originalImageInBase64); // this method will detect the prefix.

        let newResizedBuffer = await sharp(bufferFromBase64)
            .resize({
                width: newWidth,
                height: newHeight,
            })
            .toBuffer();

        // if we need it in buffer.

        if (!toBase64) {
            return newResizedBuffer;
        }

        let finalBase64;

        if (base64WithPrefix) {
            // base64 image with the metaData
            finalBase64 = convertBufferToBase64(newResizedBuffer);
        } else {
            // base64 without prefix
            finalBase64 = convertBufferToBase64(newResizedBuffer, false);
        }

        return finalBase64;
    } catch (err) {
        console.log(err);
        return;
    }
};

module.exports = resizeImage;
