const User = require('@models/User.model');
const Order = require('@models/Order.model');

const stripe = require('stripe');
const { createStripeAccount } = require('@services/third/stripe/stripe.service');

// const firebase = require('firebase');
// TODO: UNCOMMENT AFTER OBTAINING THE SERVICE ACCOUNT
// const user_firebase = require('@config/user.firebase.config');
const { authenticate, authorize } = require("@middlewares/auth.rest.middleware");

const signupOrLogin = async (req, res, next) => {
    try {
        const { token } = req.body;
        const decodedToken = await user_firebase.auth().verifyIdToken(token);
        const { uid, email, email_verified } = decodedToken;

        // Authenticate user
        await authenticate(uid);

        // Authorize user
        const user = await authorize(uid);

        // Create or update user in database
        const existingUser = await User.findOne({ uid });
        if (existingUser) {
            existingUser.email = email;
            existingUser.email_verified = email_verified;
            await existingUser.save();
        } else {
            const newUser = new User({
                uid,
                email,
                email_verified,
            });
            await newUser.save();
        }

        res.status(200).json({
            message: 'Authentication successful!',
            user,
        });
    } catch (err) {
        console.error(err);
        res.status(401).json({
            message: 'Authentication failed!',
        });
    }
};

async function findMyProfileByUserId(userId) {
    try {
        const user = await User.findById(userId);
        return user;
    } catch (error) {
        throw error;
    }
}

async function findMyProfileByFirebaseUid(firebaseUid) {
    const user = await User.findOne({ firebase_id: firebaseUid });
    return user;
}

async function updatePersonalInfo(userId, updates) {
    try {
        const user = await User.findByIdAndUpdate(userId, updates, { new: true });
        return user;
    } catch (error) {
        throw error;
    }
}

async function updateOnboardingInfo(userId, updates) {
    try {
        const user = await User.findByIdAndUpdate(userId, { onboarding: updates }, { new: true });
        return user;
    } catch (error) {
        throw error;
    }
}

async function updateAddresses(userId, updates) {
    try {
        const user = await User.findByIdAndUpdate(userId, { addresses: updates }, { new: true });
        return user;
    } catch (error) {
        throw error;
    }
}

async function updateUserPersonalInfo(firebaseUid, email, password) {
    // Update email in Firebase Auth
    // const user = await user_firebase.auth().findUser(firebaseUid);
    // await user_firebase.auth().updateUser(firebaseUid, { email: email });

    // Update email in User model
    const updatedUser = await User.findOneAndUpdate({ firebase_id: firebaseUid }, { email: email }, { new: true });

    // Update password in Firebase Auth (if provided)
    if (password) {
        // await user_firebase.auth().updateUser(firebaseUid, { password: password });
    }

    return updatedUser;
}

async function updateUserOnboardingInfo(firebaseUid, primaryAddress, primaryCard) {
    // Create a new Stripe customer object
    const customer = await stripe.customers.create({
        email: primaryAddress.email,
        name: `${primaryAddress.firstName} ${primaryAddress.lastName}`,
        address: {
            line1: primaryAddress.address1,
            line2: primaryAddress.address2,
            city: primaryAddress.city,
            state: primaryAddress.state,
            postal_code: primaryAddress.postalCode,
            country: primaryAddress.country,
        },
    });

    // Update user's primary address and Stripe customer ID
    const updatedUser = await User.findOneAndUpdate(
        { firebase_id: firebaseUid },
        {
            'addresses.0': primaryAddress,
            $set: { stripe_customer_id: customer.id },
        },
        { new: true }
    );

    // Update user's primary payment method (Stripe)
    await stripe.paymentMethods.attach(primaryCard.paymentMethodId, { customer: customer.id });
    await stripe.customers.update(customer.id, { default_payment_method: primaryCard.paymentMethodId });

    return updatedUser;
}

async function updateUserAddresses(firebaseUid, addresses) {
    const updatedUser = await User.findOneAndUpdate(
        { firebase_id: firebaseUid },
        { addresses: addresses },
        { new: true }
    );
    return updatedUser;
}

async function updateUserPaymentMethods(firebaseUid, paymentMethods) {
    const updatedUser = await User.findOneAndUpdate(
        { firebase_id: firebaseUid },
        { paymentMethods: paymentMethods },
        { new: true }
    );
    return updatedUser;
}

async function updateUserFavoriteAuctions(firebaseUid, favoriteAuctions) {
    const updatedUser = await User.findOneAndUpdate(
        { firebase_id: firebaseUid },
        { favoriteAuctions: favoriteAuctions },
        { new: true }
    );
    return updatedUser;
}

async function findUserBiddingHistory(firebaseUid) {
    const user = await User.findOne({ firebase_id: firebaseUid });
    return user.biddingHistory;
}

async function findUserOrdersHistory(userId) {
    const orders = await Order.find({ user: userId }).populate('items.product');

    return orders;
}

async function findUserFavoriteAuctions(userId, firebaseUid) {
    const user = await User.findById(userId).populate('favoriteAuctions');
    return user.favoriteAuctions;
}

async function updateUserRequiredInfo(userId, requiredInfo) {
    const user = await User.findByIdAndUpdate(userId, requiredInfo, { new: true });
    return user;
}

async function findFavoriteAuctions(userId) {
    const user = await User.findById(userId).populate('favoriteAuctions');
    return user.favoriteAuctions;
}

async function updateFavoriteAuctions(userId, favoriteAuctionIds) {
    const user = await User.findByIdAndUpdate(userId, {
        $set: { favoriteAuctions: favoriteAuctionIds },
    }, { new: true });
    return user.favoriteAuctions;
}

async function findBiddingHistory(userId) {
    const bids = await Bid.find({ bidder: userId }).populate('auction');
    return bids.map(bid => ({
        auctionId: bid.auction._id,
        title: bid.auction.title,
        bidAmount: bid.amount,
        bidTime: bid.createdAt
    }));
}

async function findOrdersHistory(userId) {
    const orders = await Order.find({ user: userId });
    return orders.map(order => ({
        orderId: order._id,
        status: order.status,
        items: order.items.map(item => ({
            productId: item.product._id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity
        })),
        total: order.total,
        createdAt: order.createdAt
    }));
}

module.exports = {
    signUpWithEmailAndPassword,
    signUpWithGoogle,
    findMyProfileByUserId,
    findMyProfileByFirebaseUid,
    updatePersonalInfo,
    updateOnboardingInfo,
    updateAddresses,
    updateUserPersonalInfo,
    updateUserOnboardingInfo,
    updateUserAddresses,
    updateUserPaymentMethods,
    updateUserFavoriteAuctions,
    findUserBiddingHistory,
    findUserOrdersHistory,
    findUserFavoriteAuctions,
    updateUserRequiredInfo,
    findFavoriteAuctions,
    updateFavoriteAuctions,
    findBiddingHistory,
    findOrdersHistory,
};