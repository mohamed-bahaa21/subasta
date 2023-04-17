const mongoose = require("mongoose");

const { Schema } = mongoose;

const bidSharedFields = {
  // used to display and query.
  publicId: {
    type: String,
    required: true,
    unique: true,
  },
  auctionId: {
    type: String,
    ref: "Auctions",
    required: true,
  },
  userId: {
    type: String,
    ref: "Users",
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
}

const BidSchema = new Schema({
  ...bidSharedFields
}, {
  timestamps: true,
});

const Bid = mongoose.model("Bid", BidSchema);
module.exports = { Bid, bidSharedFields }
