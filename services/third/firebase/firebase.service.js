const { storageBucket } = require('@config/user.firebase.config');
const sharp = require('sharp');

const Logger = require('@services/third/winston/winston.service');
const logger = new Logger('firebase.service');

/**
 * Retrieve a list of image URLs from Firebase Storage and return an array of signed URLs.
 * @param {string} bucket - The name of the Firebase Storage bucket where the images are stored.
 * @param {Array<string>} imageUrls - An array of image file names (including extensions) to retrieve.
 * @returns {Promise<Array<string>>} - An array of signed URLs for the requested images.
 */
async function getImages(bucket, imageUrls) {
    try {
        const images = [];

        for (const imageUrl of imageUrls) {
            const file = storageBucket.file(`${bucket}/${imageUrl}`);
            const [url] = await file.getSignedUrl({
                action: 'read',
                expires: '03-09-2491',
            });
            images.push(url);
        }

        return images;
    } catch (error) {
        logger.error(`Error getting images: ${error.message}`);
        throw new Error('Unable to retrieve images');
    }
}

/**
 * Uploads an image to a Firebase Storage bucket.
 *
 * @param {string} bucket - The name of the bucket.
 * @param {object} image - The image file to upload.
 * @returns {Promise<string>} - A Promise that resolves with the name of the uploaded image file or null if the upload fails.
 */
async function uploadImage(bucket, image) {
    try {
        const { originalname, buffer, mimetype } = image;

        // Create a reference to the file in the bucket with the original filename
        const file = storageBucket.file(`${bucket}/${originalname}`);

        // Create a write stream for the file
        const stream = file.createWriteStream({
            metadata: { contentType: mimetype },
            resumable: false,
        });

        // Handle errors during the upload
        stream.on('error', (error) => {
            logger.error(`Error uploading image ${originalname}: ${error.message}`);
        });

        // Log a message when the upload completes
        stream.on('finish', () => {
            logger.info(`Image ${originalname} uploaded successfully`);
        });

        // Write the image data to the file
        stream.end(buffer);

        // Return the original filename if the upload succeeds
        return originalname;
    } catch (error) {
        logger.error(`Error uploading image: ${error.message}`);
        return null;
    }
}

/**
 * Resizes an image in the specified Firebase Cloud Storage bucket using the sharp library.
 *
 * @param {string} bucket - The name of the bucket where the image is located.
 * @param {string} imageUrl - The name of the image file to resize.
 * @returns {Promise<string>} - A Promise that resolves with the filename of the resized image.
 *                             If the image is already within the desired size limit (800px), the
 *                             Promise resolves with the original filename.
 */
async function resizeImage(bucket, imageUrl) {
    try {
        // Get a reference to the image file in the specified bucket
        const file = storageBucket.file(`${bucket}/${imageUrl}`);

        // Get the width and height of the image using the sharp library
        const [width, height] = await sharp(file)
            .metadata()
            .then((metadata) => [metadata.width, metadata.height]);

        // Check if the image is already within the desired size limit (800px)
        if (width <= 800 && height <= 800) {
            return imageUrl;
        }

        // Calculate the new height and width of the resized image
        const newWidth = 800;
        const newHeight = Math.round((newWidth * height) / width);

        // Generate a new filename for the resized image
        const newFilename = `${imageUrl.split('.')[0]}_resized.jpg`;

        // Resize the image using the sharp library and save it to a temporary file
        await sharp(file)
            .resize(newWidth, newHeight)
            .toFile(`temp/${newFilename}`);

        // Get a reference to the resized image file in the specified bucket
        const resizedFile = storageBucket.file(`${bucket}/${newFilename}`);

        // Upload the resized image file to the specified bucket and set the content type
        await resizedFile.save(`temp/${newFilename}`, { contentType: 'image/jpeg' });

        // Delete the original image file from the specified bucket
        await file.delete();

        // Log a success message and return the filename of the resized image
        logger.info(`Image ${imageUrl} resized successfully`);
        return newFilename;
    } catch (error) {
        // If an error occurs, log an error message and return the original filename
        logger.info(`Error resizing image ${imageUrl}: ${error.message}`);
        return imageUrl;
    }
}

/**
 * Deletes an image file from Firebase Storage.
 * @param {string} bucket - The name of the bucket where the file is located.
 * @param {string} image - The name of the image file to delete.
 * @returns {Promise<void>} - A Promise that resolves when the image file has been deleted, or rejects with an error.
 */
async function deleteImage(bucket, image) {
    try {
        const file = storageBucket.file(`${bucket}/${image}`);
        await file.delete();
        logger.info(`Image ${image} deleted successfully`);
    } catch (error) {
        logger.info(`Error deleting image ${image}: ${error.message}`);
    }
}

module.exports = { getImages, uploadImage, resizeImage, deleteImage }