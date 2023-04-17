// TODO: UNCOMMENT AFTER OBTAINING THE SERVICE ACCOUNT
// const `firebaseAdmin` = require('@config/user.firebase.config');
const { authenticate, authorize } = require("@middlewares/auth.rest.middleware");
let userService = require('@services/first/private/user.private.service')

// POST CreateOrLoadProfile(Special API will be called after signing in /up. If the user has a profile in the db, must be returned otherwise, we should create a profile and return it.
async function createOrLoadProfile(req, res, next) {
    try {
        const firebaseToken = req.body.firebaseToken;
        // const decodedToken = await firebaseAdmin.auth().verifyIdToken(firebaseToken);
        const { uid, email, email_verified } = decodedToken;

        // Authenticate user
        await authenticate(uid);
        // Authorize user
        const user = await authorize(uid);

        // If user does not exist in database, create a placeholder user doc
        if (!user) {
            const newUser = new User({ _id: uid, email, email_verified });
            await newUser.save();
        }

        // Return user information and token
        const token = jwt.sign({ userId: uid }, process.env.JWT_SECRET);
        res.status(200).json({ userId: uid, email, token });
    } catch (err) {
        console.error(err);
        res.status(401).json({ error: "Unauthorized" });
    }
};

// GET myProfile(Fetch current user profile, using firebase token which contains the UID).
async function getMyProfile(req, res) {
    try {
        const userId = req.user.id;
        const userProfile = await userService.findUserProfile(userId);
        res.status(200).json(userProfile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// PUT update user personal info, change email from firebase - admin in the backend, and change the password(frontend).
async function postPersonalInfo(req, res) {
    try {
        const userId = req.user.id;
        const personalInfo = req.body;
        const updatedUserProfile = await userService.updateUserPersonalInfo(userId, personalInfo);
        res.status(200).json(updatedUserProfile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


// PUT update user required information for the onboarding flow, primary address, then, primary credit card(Needs to follow and onboard user on Stripe as well).
// onboarding/verification Step 1: Personal info
async function submitPersonalInfo(req, res, next) {
    const { userId } = req.user;
    const { firstName, lastName, phoneNumber } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.firstName = firstName;
        user.lastName = lastName;
        user.phoneNumber = phoneNumber;
        user.onboardingStep = "personalInfo";
        await user.save();

        res.json({ message: 'Personal information submitted successfully', step: 2 });
    } catch (error) {
        next(error);
    }
}

async function submitAddress(req, res, next) {
    const { userId } = req.user;
    const { streetAddress, streetAddress2, city, state, postalCode, country, addressType } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.addresses.push({
            streetAddress,
            streetAddress2,
            city,
            state,
            postalCode,
            country,
            addressType,
        });
        user.onboardingStep = "individualAddress";
        await user.save();

        res.json({ message: 'Address submitted successfully', step: 3 });
    } catch (error) {
        next(error);
    }
}

async function submitPayment(req, res, next) {
    const { userId } = req.user;
    const { cardNumber, nameOnCard, expirationDate, cvv } = req.body;
    const card = { cardNumber, nameOnCard, expirationDate, cvv };

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const stripeAccountId = await createStripeAccount(user, card);
        user.stripeAccountId = stripeAccountId;
        user.onboardingStep = "payment";

        await user.save();

        res.json({ message: 'Payment submitted successfully', onboardingComplete: true });
    } catch (error) {
        next(error);
    }
}

async function postOnboardingInfo(req, res) {
    try {
        const userId = req.user.id;
        const onboardingInfo = req.body;
        const updatedUserProfile = await userService.updateUserOnboardingInfo(userId, onboardingInfo);
        res.status(200).json(updatedUserProfile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


// PUT update user addresses(Add new one, remove, mark as default, etc).
async function postAddresses(req, res) {
    try {
        const userId = req.user.id;
        const addresses = req.body;
        const updatedUserProfile = await userService.updateUserAddresses(userId, addresses);
        res.status(200).json(updatedUserProfile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// PUT update user payment methods(Add new one, remove one, mark as default, current payment methods are stripe cards and).
async function postPaymentMethods(req, res, next) {
    try {
        const updatedUser = await userService.updatePaymentMethods(req.user.uid, req.body);
        return res.status(200).json(updatedUser);
    } catch (err) {
        next(err);
    }
}

// GET user favorite auctions(Watch List)
async function getFavoriteAuctions(req, res, next) {
    try {
        const favoriteAuctions = await userService.findFavoriteAuctions(req.user.uid);
        return res.status(200).json(favoriteAuctions);
    } catch (err) {
        next(err);
    }
}



// PUT update user favorite auctions(Watch List).update the events or the notification method.
async function postFavoriteAuctions(req, res, next) {
    try {
        const updatedUser = await userService.updateFavoriteAuctions(req.user.uid, req.body);
        return res.status(200).json(updatedUser);
    } catch (err) {
        next(err);
    }
}

// GET user bidding history.
async function getBiddingHistory(req, res, next) {
    try {
        const biddingHistory = await userService.findBiddingHistory(req.user.uid);
        return res.status(200).json(biddingHistory);
    } catch (err) {
        next(err);
    }
}

// GET user orders history.  
async function getOrderHistory(req, res, next) {
    try {
        const orderHistory = await userService.findOrderHistory(req.user.uid);
        return res.status(200).json(orderHistory);
    } catch (err) {
        next(err);
    }
}

// GET user orders history
async function getOrdersHistory(req, res, next) {
    try {
        const userId = req.user._id;
        const orders = await userService.findOrdersHistory(userId);
        res.status(200).json({ orders });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// POST create a bid on an auction
async function createBid(req, res, next) {
    try {
        const userId = req.user._id;
        const auctionId = req.params.auctionId;
        const amount = req.body.amount;
        const bid = await userService.createBid(userId, auctionId, amount);
        res.status(200).json({ bid });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createOrLoadProfile,
    submitPersonalInfo,
    submitAddress,
    submitPayment,
    getMyProfile,
    getFavoriteAuctions,
    getBiddingHistory,
    getOrderHistory,
    getOrdersHistory,
    postPersonalInfo,
    postOnboardingInfo,
    postAddresses,
    postPaymentMethods,
    postFavoriteAuctions,
    createBid,
};