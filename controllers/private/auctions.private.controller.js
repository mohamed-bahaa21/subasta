const Bid = require('@models/Bid.model');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Auction = require('@models/Auction.model');
const Payment = require('@models/Payment.model');
let { confirmPayment, placeBid } = require('@services/first/private/auctions.private.service')

async function postConfirmPayment(req, res, next) {
    try {
        const { auctionId, userId } = req.params;
        const { paymentProofUrl } = req.body;

        const result = await confirmPayment(auctionId, userId, paymentProofUrl);

        // Return the result as a response
        res.json(result);
    } catch (error) {
        next(error)
    }
}

async function getAuctionBids(req, res, next) {
    try {
        const auctionId = req.params.auctionId;

        // Query all bids with the specified auctionId
        const bids = await Bid.find({ auction: auctionId })
            .populate('user', 'firstName lastName')
            .sort('-createdAt')
            .exec();

        return res.status(200).json(bids);
    } catch (error) {
        next(error);
    }
}

async function postCreateCharge(req, res) {
    const { auctionId, amount, currency, token } = req.body;

    try {
        // Get the auction to charge
        const auction = await Auction.findById(auctionId);

        if (!auction) {
            return res.status(404).json({ error: 'Auction not found' });
        }

        // Charge the user's credit card using Stripe
        const charge = await stripe.charges.create({
            amount,
            currency,
            source: token,
            description: `Payment for auction ${auction.title}`,
        });

        // Create a payment record in the database
        const payment = new Payment({
            auctionId: auction._id,
            amount: charge.amount,
            currency: charge.currency,
            paymentProof: charge.id,
        });

        await payment.save();

        // Update the auction status to "sold"
        auction.status = 'sold';
        await auction.save();

        // Return the payment proof
        res.json({ paymentProof: charge.id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to process payment' });
    }
}

module.exports = { postCreateCharge, postConfirmPayment, getAuctionBids }