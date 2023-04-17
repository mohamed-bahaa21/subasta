const mongoose = require('mongoose');
let { ObjectId } = mongoose.Schema.Types;

const ProductSchema = require('./Product.model')
const { productSharedFields } = require('./Product.model')
const { bidSharedFields } = require('./Bid.model')


const AuctionSchema = new mongoose.Schema({
  name: { type: String, required: false, index: true },
  description: { type: String, required: false, index: true },
  publicId: { type: String, required: true, unique: true, },
  ownerId: { type: ObjectId, ref: 'User' },
  product: { ...productSharedFields },
  // in case of admin creating auction and want to reference a company.
  supplierName: { type: String, },
  status: { type: String, enum: ['running', 'paused', 'processing', 'cancelled', 'ended', 'won'], required: true, },
  statusMessage: { type: String, required: false, default: '', },
  paymentStatus: { type: String, enum: ['not attempted', 'pending', 'succeeded', 'failed', 'refunded'], required: true, default: 'not attempted', },
  paymentMethod: { type: String, enum: ['stripe', 'etransfer', 'not set', 'wire', 'cash'], required: true, default: 'not set', },
  // timing & price
  startingDate: { type: Date, required: true, },
  endingDate: { type: Date, required: true, },
  startingPrice: { type: Number, required: true, },
  // auction handling fee either flat or percentage...
  handlingFee: { type: { isPercent: Boolean, value: Number }, required: true, default: { isPercent: true, value: 10 }, },
  // this is the final price when the auction closes, include the winning Bid,
  // shippingCost, Handling Fee, Tax all added...
  finalPrice: { type: Number, default: null, required: function () { this.status === 'won'; }, },
  bidMinimumDifference: { type: Number, required: true, },
  totalBids: { type: Number, required: true, default: 0, },
  bids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bid', default: null, }],
  latestBid: { ...bidSharedFields },
}, {
  timestamps: true,
});

AuctionSchema.index({ name: 'text', description: 'text' });
const Auction = mongoose.model('Auction', AuctionSchema);
module.exports = Auction;
