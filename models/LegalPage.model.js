const mongoose = require('mongoose')

const LegalPageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    lang: {
        type: String,
        enum: ["en", "es", "er", "fr"],
        required: true
    },
    content: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Editor'
    },
    blocks: {
        type: Array,
        required: true
    }
})

const LegalPage = mongoose.model('LegalPage', LegalPageSchema);
module.exports = LegalPage