const mongoose = require("mongoose");

// will be embeded in the user model.
const AddressSchema = new mongoose.Schema({
    addressName: {
        type: String,
        default: "home",
        required: false,
        minLength: 2,
        maxLength: 255,
    },
    streetAddress: {
        type: String,
        required: true,
        minLength: 2,
        maxLength: 1000,
    },
    userFullName: {
        type: String,
        required: true,
        minLength: 2,
        maxLength: 255,
    },
    userPhoneNumber: {
        type: String,
        required: true,
        minLength: 2,
        maxLength: 255,
    },
    // address line 2 optional Apartment, suit, unit, etc.
    additionalAddress: { type: String, default: "", required: false },
    // company name optional // REMOVE
    company: { type: String, default: "", required: false },
    // city / town
    city: { type: String, required: true },
    // postCode or ZIP
    zipCode: { type: String, required: true },
    // state / county / province
    state: { type: String, required: true },
    // country / region
    country: { type: String, required: true },
    // store the address type if shippng address, payment address or both of them as default in all stores.
    addressType: {
        type: String,
        required: true,
        default: "both",
        enum: ["both", "shipping", "payment"],
    },
});

module.exports.Address = mongoose.model('Address', AddressSchema);