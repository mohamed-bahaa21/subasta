const mongoose = require('mongoose');
const { Schema } = mongoose;

const categorySharedFields = {
  name: { type: String, required: true, /* unique: true,*/ },
  slug: { type: String, required: true,/* unique: true,*/ },
  language: { type: String, enum: ["en", "es", "er", "fr"], required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
}

const CategorySchema = new Schema({
  ...categorySharedFields
}, {
  timestamps: true,
});

const Category = mongoose.model('Category', CategorySchema);
module.exports = { Category, categorySharedFields };
