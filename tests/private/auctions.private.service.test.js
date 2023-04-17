const mongoose = require('mongoose');

const assert = require('assert');
const { expect } = require('chai');
const sinon = require('sinon');

const User = require('@models/User.model')
const Auction = require('@models/Auction.model')
const Bid = require('@models/Bid.model')
const {
    confirmPayment
} = require('@services/first/private/auctions.private.service');
const { connect } = require('../db.test');

describe('GET /api/public/auctions services', () => {
    let findStub;
    let db;

    before(async () => {
        await connect();

        console.log('====================================');
        console.log("Started Auctions.Private.Service.Test");
        console.log('====================================');
    })

    after(() => {
        console.log('====================================');
        console.log("Finished Auctions.Private.Service.Test");
        console.log('====================================');
    });

    // confirmPayment
    it('should confirm payment for an auction', async () => {
        // Setup
        const auction = Auction.findOne({ status: "running" });
        const user = User.findOne();
        const bid = new Bid({ auction: auction._id, user: user._id, amount: 110 });

        const paymentProof = 'stripe_test_token';
        const amount = 110;
        const currency = 'usd';

        // Execution
        const payment = await confirmPayment(auction._id, user._id, paymentProof, amount, currency);

        // Assertion
        expect(payment.message).to.be.oneOf([
            "couldn't find auction",
            "couldn't find bid",
            'Payment has already been confirmed for this auction',
            'Stripe charge creation failed',
            'Charge succeeded',
        ]);

        if (payment && payment.message === 'Charge succeeded') {
            expect(payment.auction).to.equal(auction._id);
            expect(payment.user).to.equal(user._id);
            expect(payment.amount).to.equal(amount);
            expect(payment.currency).to.equal(currency);
            expect(payment.paymentProof).to.equal(paymentProof);
        }
    });

    // ===================================================================================
});