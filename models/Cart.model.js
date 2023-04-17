const mongoose = require("mongoose");
let { ObjectId } = mongoose.Schema.Types;

const CartSchema = new mongoose.Schema({
  userId: {
    type: ObjectId,
    ref: 'User',
    required: true,
  },

  products: [{
    // _id: auto generated monog.
    productId: {
      type: ObjectId,
      ref: 'Product',
    },
    name: String,
    slug: String,
    // this quantity means the selected
    // by user and not the available by the product itself.
    unitPrice: Number,
    quantity: Number,
    condition: String,
    packaging: String,

    dimensions: {
      width: Number, // CM
      height: Number, // CM
      length: Number, // CM
      weight: Number, // Grams
    },
    photoUrl: String,

    totalPrice: Number, // for the product total price => unit price * quantity.
  }],

  // hold the cart total price.
  // Without the copuon discount.
  // always must be present.
  totalPrice: { type: Number, required: true },

  // hold the count of all items, the sum of all quantities of the combinations.
  totalItems: { type: Number, required: true },

  // the coupon discount object if applies.
  coupon: {
    type: {
      amount: Number,
      isPercent: Boolean,
      code: String,
    },
    default: null,
  },

  // the final price must be not null if we have a coupon present.
  priceAfterCoupon: {
    type: Number,
    default: null,
    required: function () {
      // required only if the coupon is there.
      this.coupon !== null;
    },
  },
}, {
  timestamps: true,
});

const Cart = new mongoose.model("Cart", CartSchema);
module.exports = Cart;
