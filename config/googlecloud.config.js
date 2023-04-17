const { Storage } = require("@google-cloud/storage");

const google_account = {
    "type": process.env.GCLOUD_type,
    "project_id": process.env.GCLOUD_project_id,
    "private_key_id": process.env.GCLOUD_private_key_id,
    "private_key": process.env.GCLOUD_private_key,
    "client_email": process.env.GCLOUD_client_email,
    "client_id": process.env.GCLOUD_client_id,
    "auth_uri": process.env.GCLOUD_auth_uri,
    "token_uri": process.env.GCLOUD_token_uri,
    "auth_provider_x509_cert_url": process.env.GCLOUD_auth_provider_x509_cert_url,
    "client_x509_cert_url": process.env.GCLOUD_client_x509_cert_url,
}

const BUCKET_NAME = "auction-main.appspot.com";

const STORAGE_PATH = "https://storage.googleapis.com/";
const BUCKET_PATH = "auction-main.appspot.com/";
const CARTS_FOLDER = "carts/";
const PRODUCTS_FOLDER = "products/";
const AUCTIONS_FOLDER = "auctions/";
const USERS_FOLDER = "users/";
const ORDERS_FOLDER = "orders/";

const PNG_IMAGE_EXTENSTION = ".png";

const storage = new Storage({
    projectId: "auction-main",
    keyFilename: google_account,
});

let bucket = storage.bucket(BUCKET_NAME);

module.exports = {
    bucket,
    storage,
    PRODUCTS_FOLDER,
    USERS_FOLDER,
    AUCTIONS_FOLDER,
    CARTS_FOLDER,
    ORDERS_FOLDER,
    PNG_IMAGE_EXTENSTION,
    STORAGE_PATH,
    BUCKET_PATH,
};
