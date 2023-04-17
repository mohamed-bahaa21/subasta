const Logger = require('../winston/winston.service');
const logger = new Logger('private.socket.service');

const Auction = require('@models/Auction.model');
const Bid = require('@models/Bid.model');
const User = require('@models/Bid.model');

/*
1. Checks if the user is onboarded, and if not, it emits a "not-onboarded" event and returns.
2. Checks if the auction exists and is currently running. If not, it throws an error.
3. Checks if the bid amount is higher than the current highest bid. 
    If it is not, it throws an error. 
    If it is, it creates a new bid with the given bid amount and user ID.
    
4. If the difference between the new bid amount and the current highest bid 
    is greater than or equal to the minimum bid difference for the auction, 
    it checks if there is an existing proxy bid that can be used to outbid the current highest bid. 
    If there is, it uses the existing proxy bid, updates the bid with the new amount, 
    and emits an "outbid" event. 
    If there is not, it creates a new proxy bid, 
    updates the bid with the new amount, 
    and emits a "new-proxy-bid" event.

5. Then updates the auction with the latest bid information 
    and emits a "new-bid" event to all connected users for the auction, 
    and a "bid-success" event to the user who placed the bid. 
    If there are any errors during this process, 
    it emits a "bid-error" event with the error message.
*/
function privateSocket(io) {
    io.on("connection", (socket) => {
        logger.info("private user connected");

        socket.on("disconnect", () => { })
        socket.on("join-auction-room", () => { })
        socket.on("leave-auction-room", () => { })
        socket.on("new-bid", async (auctionId, userId, bidAmount, callback) => {
            try {
                // Check if user is onboarded
                const onboarded = await User.findOne(userId).onboarded;
                if (!onboarded) {
                    socket.emit('not-onboarded');
                    return;
                }

                // Check if auction exists and is running
                const auction = await Auction.findOne({
                    _id: auctionId,
                    status: 'running',
                    endDateTime: { $gt: new Date() }
                });
                if (!auction) {
                    throw new Error('Auction not found or not running');
                }

                // Check if bid amount is higher than current highest bid
                // Bid sniping
                const currentHighestBid = await Bid.findOne({ auction: auctionId }).sort('-amount');
                if (currentHighestBid) {
                    // Calculate the minimum bid amount required to outbid the current highest bid, including sniping
                    const minBidAmount = currentHighestBid.price + auction.bidMinimumDifference;
                    const timeLeftMs = auction.endDateTime - new Date();
                    const timeLeftSeconds = timeLeftMs / 1000;
                    const snipeSeconds = 5; // Set the snipe time to 5 seconds, but you can adjust this value
                    const snipeMs = snipeSeconds * 1000;
                    if (timeLeftMs <= snipeMs && bidAmount >= minBidAmount) {
                        // If there is less than 5 seconds left and the bid is higher than or equal to the minimum bid amount,
                        // set the bid amount to the minimum bid amount
                        bidAmount = minBidAmount;
                    } else if (bidAmount < minBidAmount) {
                        // If the bid amount is lower than the minimum bid amount, throw an error
                        throw new Error('Bid amount is not higher than current highest bid');
                    }
                }

                // Create new bid
                const bid = new Bid({
                    auction: auctionId,
                    user: userId,
                    amount: bidAmount
                });

                // Check if bid is a proxy bid
                const minimumDifference = auction.bidMinimumDifference;
                const bidDifference = bid.price - (currentHighestBid ? currentHighestBid.price : auction.startingPrice);
                let isProxyBid = false;
                if (bidDifference >= minimumDifference) {
                    // Check if there's a proxy bid
                    const proxyBid = await Bid.findOne({ auction: auctionId, isProxy: true }).sort('-amount');
                    if (proxyBid && bidDifference > (proxyBid.price - currentHighestBid.price)) {
                        // Use existing proxy bid
                        bid.isProxy = true;
                        bid.price = proxyBid.price + minimumDifference;
                        isProxyBid = true;

                        // Notify users of outbidding
                        const outbidData = {
                            outbidAmount: bid.price,
                            outbidUser: userId,
                            bidderUser: proxyBid.user
                        };
                        // Save the bid before emitting the event
                        await bid.save();
                        io.to(auctionId).emit('outbid', outbidData);
                    } else {
                        // Create new proxy bid
                        bid.isProxy = true;
                        bid.price = bid.price - (bidDifference % minimumDifference) + minimumDifference;
                        isProxyBid = true;

                        // Notify users of new proxy bid
                        io.to(auctionId).emit('new-proxy-bid', {
                            bidderUser: userId,
                            proxyAmount: bid.price
                        });
                        // Save the bid after emitting the event
                        await bid.save();
                    }
                }

                // Update auction with new bid information
                auction.latestBid = bidAmount;
                auction.bidCount += 1;
                if (auction.endDateTime - new Date() < 5 * 60 * 1000) {
                    // If auction ends in less than 5 minutes, extend endDateTime by 6 minutes
                    auction.endDateTime = new Date(Date.now() + 6 * 60 * 1000);
                }
                await auction.save();

                // Get the updated auction with the latest bid information
                const updatedAuction = await Auction.findOne({ _id: auctionId });

                // Emit events to socket users
                const eventData = {
                    auction: updatedAuction.toObject(),
                    newBid: bid.toObject(),
                    isProxyBid
                };
                io.to(auctionId).emit('new-bid', eventData);
                io.to(`user-${userId}`).emit('bid-success', eventData);

            } catch (error) {
                console.error(error);
                socket.emit('bid-error', error.message);
                return;
            }
        });
        socket.on("auction-ended", () => { })
    });
}

module.exports = privateSocket;