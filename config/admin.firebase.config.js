const admin_firebase = require('firebase-admin');
const serviceAccount = {
    type: process.env.ADMIN_FIREBASE_type,
    project_id: process.env.ADMIN_FIREBASE_project_id,
    private_key_id: process.env.ADMIN_FIREBASE_private_key_id,
    private_key: process.env.ADMIN_FIREBASE_private_key,
    client_email: process.env.ADMIN_FIREBASE_client_email,
    client_id: process.env.ADMIN_FIREBASE_client_id,
    auth_uri: process.env.ADMIN_FIREBASE_auth_uri,
    token_uri: process.env.ADMIN_FIREBASE_token_uri,
    auth_provider_x509_cert_url: process.env.ADMIN_FIREBASE_auth_provider_x509_cert_url,
    client_x509_cert_url: process.env.ADMIN_FIREBASE_client_x509_cert_url
}

admin_firebase.initializeApp({
    credential: admin_firebase.credential.cert(serviceAccount),
    databaseURL: 'https://your-project-id.firebaseio.com'
}, 'adminApp');

module.exports = admin_firebase