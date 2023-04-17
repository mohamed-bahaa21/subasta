const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const FAQSchema = new Schema({
    "language": {
        type: String,
        enum: ["en", "es", "er", "fr"],
        required: true,
    },
    "question": {
        type: String,
        required: true
    },
    "answer": {
        type: String,
        required: true
    },
})

const FAQ = mongoose.model('FAQ', FAQSchema);
module.exports = FAQ