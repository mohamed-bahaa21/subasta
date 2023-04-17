const mongoose = require("mongoose");

const { CartSchema } = require("./Cart.model");
const { AddressSchema } = require("./User.model");

const OrderSchema = new mongoose.Schema({
  // mongo _id will be auto generated.
  // to show the users, and use in the ui urls.
  publicId: {
    type: String,
    required: true,
  },

  cartId: {
    type: String,
    required: true,
  },

  // userId/customer who bought this order.
  userId: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    enum: [
      "pending", // BEFORE STRIPE CONFIRM PAYMENTS // PENDING PAYMNETS CONFIRMATION.
      "processing", // THIS IS THE FIRST STEP LIKE ACCEPTED.
      "complete",
      "shipped",
      "canceled",
      "refunded",
    ],
    default: "pending",
    required: true,
  },

  statusMessage: {
    type: String,
    required: false,
    default: "",
  },
  // TODO
  // will embed the total cart here with totalPrice, coupon and stuff.
  cart: {
    type: CartSchema,
    required: false, // I need it off, so I can have an initial order created,
    //  before assigning a cart.
  },
  // we will offer free shipping for now.
  shippingCost: {
    type: {
      description: String,
      cost: Number,
    },
    default: {
      description: "Free Shipping.",
      cost: 0,
    },
    required: true,
  },

  tax: {
    type: {
      description: String,
      cost: Number,
    },

    default: {
      description: "Tax included.",
      cost: 0,
    },
    required: true,
  },
  // TODO
  shippingAddress: {
    type: AddressSchema,
  },
  shipmentTrackingURL: String,
  paymentMethod: {
    type: String,
    default: "stripe",
  },
  stripePaymentId: {
    type: String,
    required: false
  },
  refundId: {
    type: String,
    required: false
  },
  refundAmount: {
    type: Number,
    required: false
  },
  transactionId: String, // if stripe will be paymentIntentId which I will have accsess to.
  totalPrice: {
    // after calculating shipping and taxes over the cart price.
    type: Number,
    required: true,
    default: 0,
  },
  placedAt: {
    type: Date,
    default: Date.now(), // it doesnot work.
    required: true,
  },
}, {
  timestamps: true,
});

const Order = new mongoose.model("Order", OrderSchema);

module.exports.Order = Order;
