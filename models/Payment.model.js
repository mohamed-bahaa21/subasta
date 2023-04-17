const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    auction: { type: mongoose.Schema.Types.ObjectId, ref: 'Auction', required: true },
    paymentProof: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    paymentDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', PaymentSchema);