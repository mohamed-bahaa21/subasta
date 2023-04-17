const mongoose = require("mongoose");
const { AddressSchema } = require('./Address.model');

const UserSchema = new mongoose.Schema({
  firebase_id: { type: String, trim: true },
  displayName: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  fullName: { type: String },
  email: { type: String, unique: true, trim: true, required: true },
  phoneNumber: { type: String },
  verified: { type: Boolean, default: false, required: true },
  photoURL: { type: String },
  emailVerfied: Boolean,
  accountType: { type: String, enum: ["individual", "company", null], default: null },
  companyName: {
    type: String,
    required: function () {
      return this.accountType === "company";
    },
  },
  signInProvider: { type: String, enum: ["email", "firebase"], default: null },
  addresses: {
    type: [AddressSchema],
    required: true,
    default: [],
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  legalEntity: {
    firstName: { type: String },
    lastName: { type: String },
    type: { type: String, enum: ["individual", "company"] },
    // address: { type: AddressSchema },
    dob: {
      day: { type: Number },
      month: { type: Number },
      year: { type: Number },
    },
    ssnLast4: { type: String },
  },
  onboardingStep: { type: String, enum: ["personalInfo", "individualAddress", "payment"], default: "personalInfo" },
  isOnboarded: Boolean,
}, {
  timestamps: true,
});

const User = mongoose.model("User", UserSchema);
module.exports = User;

