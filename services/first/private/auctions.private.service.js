const Auction = require('@models/Auction.model');
const Bid = require('@models/Bid.model');
const User = require('@models/User.model');
const Payment = require('@models/Payment.model');

async function confirmPayment(auctionId, userId, paymentProof) {
    try {
        // Find the auction with the specified ID
        const auction = await Auction.findById(auctionId);
        if (!auction) return { message: "couldn't find auction" };

        // Find the winning bid for the auction
        const bid = await Bid.findOne({ auction: auctionId, user: userId }).sort('-amount');
        if (!bid) return { message: "couldn't find bid" };

        // Check if the auction has already been paid for
        const existingPayment = await Payment.findOne({ auction: auctionId, user: userId });
        if (existingPayment) return { message: 'Payment has already been confirmed for this auction' };

        // Define the amount and currency for the Stripe charge
        const amount = bid.amount;
        const currency = 'usd';

        // Create a new Stripe charge object
        const charge = await stripe.charges.create({
            amount: amount,
            currency: currency,
            source: paymentProof,
        });

        // If charge succeeded, update auction and payment models in database
        // and send success response back to client
        await Auction.findOneAndUpdate({ _id: auctionId }, { $set: { status: 'completed' } });
        const payment = new Payment({
            auction: auctionId,
            user: userId,
            amount: amount,
            currency: currency,
            paymentProof: paymentProof,
            status: 'succeeded',
        });
        await payment.save();

        return { message: "Charge succeeded", auction: auctionId, user: userId, amount: amount, currency: currency, paymentProof: paymentProof };
    } catch (error) {
        throw new Error(`Error confirming payment: ${error.message}`);
    }
}

async function checkUserOnboarded(userId) {
    const user = await User.findById(userId);
    return user.isOnboarded;
}

async function placeBid(io, auctionId, userId, bidAmount) {
    // Check if user is onboarded
    const onboarded = await checkUserOnboarded(user.id);
    if (!onboarded) {
        socket.emit('not-onboarded');
        return;
    }

    // Check if auction exists and is running
    const auction = await Auction.findOne({
        _id: auctionId,
        status: 'running',
        endDateTime: { $gt: new Date() }
    });
    if (!auction) {
        throw new Error('Auction not found or not running');
    }

    // Check if bid amount is higher than current highest bid
    const currentHighestBid = await Bid.findOne({ auction: auctionId }).sort('-amount');
    if (currentHighestBid && bidAmount <= currentHighestBid.amount) {
        throw new Error('Bid amount is not higher than current highest bid');
    }

    // Create new bid
    const bid = new Bid({
        auction: auctionId,
        user: userId,
        amount: bidAmount
    });

    // Check if bid is a proxy bid
    const minimumDifference = auction.minimumDifference;
    const bidDifference = bid.price - (currentHighestBid ? currentHighestBid.price : auction.startingPrice);
    let isProxyBid = false;
    if (bidDifference >= minimumDifference) {
        // Check if there's a proxy bid
        const proxyBid = await Bid.findOne({ auction: auctionId, isProxy: true }).sort('-price');
        if (proxyBid && bidDifference > (proxyBid.price - currentHighestBid.price)) {
            // Use existing proxy bid
            bid.isProxy = true;
            bid.amount = proxyBid.price + minimumDifference;
            isProxyBid = true;

            // Notify users of outbidding
            const outbidData = {
                outbidPrice: bid.amount,
                outbidUser: userId,
                bidderUser: proxyBid.user
            };
            // Save the bid before emitting the event
            await bid.save();
            io.to(auctionId).emit('outbid', outbidData);
        } else {
            // Create new proxy bid
            bid.isProxy = true;
            bid.price = bid.price - (bidDifference % minimumDifference) + minimumDifference;
            isProxyBid = true;

            // Notify users of new proxy bid
            io.to(auctionId).emit('new-proxy-bid', {
                bidderUser: userId,
                proxyPrice: bid.price
            });
            // Save the bid after emitting the event
            await bid.save();
        }
    }

    // Save bid to database
    await bid.save();

    // Update auction with new bid information
    auction.latestBid = bidAmount;
    auction.bidCount += 1;
    if (auction.endDateTime - new Date() < 5 * 60 * 1000) {
        // If auction ends in less than 5 minutes, extend endDateTime by 6 minutes
        auction.endDateTime = new Date(Date.now() + 6 * 60 * 1000);
    }
    await auction.save();

    // Emit events to socket users
    const eventData = {
        auction: auction.toObject(),
        newBid: bid.toObject(),
        isProxyBid
    };
    io.to(auctionId).emit('new-bid', eventData);
    io.to(`user-${userId}`).emit('bid-success', eventData);

    return bid;
}

module.exports = { confirmPayment, placeBid };