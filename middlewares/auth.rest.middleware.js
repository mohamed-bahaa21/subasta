const admin_firebase = require("@config/admin.firebase.config.js");
const user_firebase = require("@config/user.firebase.config.js");

const authenticateUser = async (req, res, next) => {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }
    const idToken = authHeader.substring(7);

    try {
        const decodedToken = await user_firebase.auth().verifyIdToken(idToken);
        req.user = decodedToken;
        next();
    } catch (ex) {
        return res.status(400).json({ message: "Invalid token." });
    }
};

const authenticateAdmin = async (req, res, next) => {
    try {
        const token = req.header("Authorization").replace("Bearer ", "");
        const decodedToken = await admin_firebase.auth().verifyIdToken(token);
        const uid = decodedToken.uid;
        const userRecord = await admin_firebase.auth().getUser(uid);
        if (userRecord.customClaims && userRecord.customClaims.admin) {
            // user is an admin
            req.uid = uid;
            next();
        } else {
            // user is not an admin
            res.status(401).send({ error: "Unauthorized" });
        }
    } catch (error) {
        console.log(error);
        res.status(401).send({ error: "Unauthorized" });
    }
};

const authorize = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            res.status(403).json({ message: 'Forbidden' });
        } else {
            next();
        }
    };
};

module.exports = { authenticateUser, authenticateAdmin }
