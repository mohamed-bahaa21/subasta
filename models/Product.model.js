const mongoose = require("mongoose");

const { categorySharedFields } = require('./Category.model')
const productSharedFields = {
  name: {
    type: String,
    required: true,
  },
  // important to fetch from frontend, for SEO.
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  // ESSENTIAL
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
  // ESSENTIAL
  category: { ...categorySharedFields },
  tags: {
    // tags in lowercase.
    type: [String],
  },
  // ?????
  location: {
    type: String,
  },
  condition: {
    type: String,
    required: true,
    enum: [
      "new",
      "used",
      "refurbished",
      "damaged",
      "incomplete",
      "salvage",
      "customer returns",
    ],
    default: "used",
  },
  packaging: {
    type: String,
    //enum
  },
  dimensions: {
    type: {
      width: Number, // CM
      height: Number, // CM
      length: Number, // CM
      weight: Number, // Grams
    },
    required: true,
  },
  shippingCost: {
    type: {
      description: String,
      cost: Number,
    },
    default: {
      description: "Shipping By DHL.",
      cost: 10,
    },
    required: true,
  },
  // this only the tax rate for the calculation like 13%, 20%...
  // the actual taxCost will be in the order model in case of retail,
  // and in the auctionModel in case of a won auction.
  taxRate: {
    type: {
      description: String,
      rate: Number,
    },
    default: {
      description: "13% Tax",
      rate: 13,
    },
    required: true,
  },
  photoGallery: [String],
  photoUrl: {
    type: String,
    // required: true,
  },
  description: {
    type: String,
    maxlength: 10000,
    required: true,
  },
  attachments: {
    type: [
      {
        name: String,
        url: String,
        type: String, // excel, pdf, etc
      },
    ],
  },
  // to show the value comparasion for the current Bid. Only auction part.
  // ecommerce part will use discount...
  estimatedValue: {
    type: Number,
  },
  ///////////////////////
  // ONLY E-COMMERCE PART
  ///////////////////////

  // canadian dollar
  // required only on e-commerce part.
  //Needs to be validated on UI.
  unitPrice: {
    type: Number,
  },
  discount: {
    type: { isPercent: Boolean, value: Number },
    default: null,
  },
  inventory: {
    type: Number,
  },
  // if true, udpate (reduce invnetory on each order.)
  trackInventory: {
    type: Boolean,
  },
  // minimum quantity to order only e-commerce part...
  minimumQuantity: {
    type: Number,
  },
  sku: {
    type: String,
  },
  // is published or draft. For public query only published.
  published: {
    type: Boolean,
    default: true,
  },
}

const ProductSchema = new mongoose.Schema({
  ...productSharedFields
}, {
  timestamps: true,
});

ProductSchema.virtual("totalCost").get(function () {
  const subtotal = this.quantity * this.unitPrice;
  const shippingCost = this.shippingCost;
  const taxRate = this.taxRate.rate / 100;
  const taxCost = subtotal * taxRate;
  const discount =
    this.discount && this.discount.isPercent
      ? subtotal * (this.discount.value / 100)
      : this.discount?.value || 0;
  return subtotal + shippingCost + taxCost - discount;
});

const Product = mongoose.model("Product", ProductSchema);
module.exports = { Product, productSharedFields }
