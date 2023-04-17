const express = require("express");
const { authenticateUser } = require("@middlewares/auth.rest.middleware");
const router = express.Router();
const {
    createOrLoadProfile,
    submitPersonalInfo,
    submitAddress,
    submitPayment,
    getMyProfile,
    postPersonalInfo,
    postOnboardingInfo,
    postAddresses,
    postPaymentMethods,
    getFavoriteAuctions,
    postFavoriteAuctions,
    getBiddingHistory,
    getOrdersHistory,
    getOrderHistory,
    createBid,
} = require("@controllers/private/user.private.controller");

// POST user signup
router.post("/createOrLoadProfile", createOrLoadProfile);
// GET myProfile
router.get("/myProfile", authenticateUser, getMyProfile);
// PUT update user personal info
router.put("/profile/personal-info", authenticateUser, postPersonalInfo);
// PUT update user required information for onboarding flow
router.put("/profile/onboarding/submit-personal-info", authenticateUser, submitPersonalInfo);
router.put("/profile/onboarding/submit-address", authenticateUser, submitAddress);
router.put("/profile/onboarding/submit-payment", authenticateUser, submitPayment);
// PUT update user addresses
router.put("/profile/addresses", authenticateUser, postAddresses);
// PUT update user payment methods
router.put("/profile/payment-methods", authenticateUser, postPaymentMethods);
// GET user favorite auctions
router.get("/favorite-auctions", authenticateUser, getFavoriteAuctions);
router.post("/favorite-auctions", authenticateUser, postFavoriteAuctions);
// PUT update user favorite auctions
router.put("/favorite-auctions", authenticateUser, postFavoriteAuctions);
// GET user bidding history
router.get("/bidding-history", authenticateUser, getBiddingHistory);
// GET user orders history
router.get("/orders-history", authenticateUser, getOrdersHistory);

module.exports = router;