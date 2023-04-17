const Auction = require('@models/auction');

// validate Bid Amount
async function validateBidAmount(auctionId, bid) { }

// Calculate Bid increment
async function calculateBidIncrement(auctionId) { }

// Calculate winning proxy bid
async function calculateWinningProxyBid(bids, startingPrice) {
  // basic sorting example
  // const sortedBids = bids.sort((a, b) => b.amount - a.amount);

  // highest proxy bid wins the auction.
  let highestBid = startingPrice;
  let winningBid = startingPrice;

  // looping through auction bids
  for (let i = 0; i < sortedBids.length; i++) {
    const bid = sortedBids[i];
    const maxBid = bid.maxBid || 0;

    if (maxBid > highestBid) {
      highestBid = maxBid;
    }

    if (highestBid > winningBid) {
      winningBid = Math.min(highestBid, bid.amount + 1);
    }
  }

  return winningBid;
}

// Calculate winning popcorn bid
async function calculateWinningPopcornBid(bids, startingPrice) {
  // basic sorting example
  const sortedBids = bids.sort((a, b) => a.amount - b.amount);

  // the highest unique popcorn bid wins the auction.
  let currentPrice = startingPrice;
  let winningBid = startingPrice;

  // looping through auction bids
  for (let i = 0; i < sortedBids.length; i++) {
    const bid = sortedBids[i];

    // choosing a winner
    if (bid.amount > currentPrice) {
      currentPrice = bid.amount;
      winningBid = currentPrice;
    }
  }

  return winningBid;
}

module.exports = {
  validateBidAmount,
  calculateBidIncrement,
  calculateWinningProxyBid,
  calculateWinningPopcornBid,
}