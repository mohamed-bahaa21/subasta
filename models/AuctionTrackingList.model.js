const mongoose = require("mongoose");

const { Schema } = mongoose;

const AuctionTrackingListSchema = new Schema({
  // _id from mongo
  userId: {
    type: String,
    ref: "Users",
    required: true,
  },

  auctionId: {
    type: String,
    required: true,
    ref: "Auctions",
  },

  events: {
    type: [
      {
        event: String,
        email: Boolean,
        sms: Boolean,
        pushNotification: Boolean,
      },
    ],

    default: [
      { event: "endingSoon", email: true, sms: true, pushNotification: true },
      {
        event: "priceChange",
        email: true,
        sms: true,
        pushNotification: true,
      },
    ],
  },
},
  {
    timestamps: true,
  }
);

module.exports.AuctionTrackingList = mongoose.model(
  "AuctionTrackingList",
  AuctionTrackingListSchema
);
module.exports.AuctionTrackingListSchema = AuctionTrackingListSchema;
