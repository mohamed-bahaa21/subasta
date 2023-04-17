const mongoose = require('mongoose');

const { Schema } = mongoose;

const FavouritesSchema = new Schema({
  userId: {
    type: String,
    ref: 'user',
  },
  auctionId: {
    type: String,
    ref: 'auctions',
  },
  isFavourite: {
    type: Boolean,
    default: false,
  },
});

module.exports.Favourites = mongoose.model('favourites', FavouritesSchema);
