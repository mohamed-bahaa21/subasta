const Logger = require('../winston/winston.service');
const logger = new Logger('public.socket.service');

const Auction = require("@models/Auction.model")

function publicSocket(io) {
  io.on("connection", (socket) => {
    logger.info(`Public-Socket ${socket.id} Connected...`);

    // Emit all active auctions to the client on initial connection
    Auction.find({ status: 'active' }).exec((err, auctions) => {
      if (err) {
        console.log(err);
      } else {
        socket.emit('activeAuctions', auctions);
      }
    });

    // Subscribe to a specific auction
    socket.on('subscribeAuction', (auctionId) => {
      socket.join(`auction_${auctionId}`);
    });

    // Unsubscribe from a specific auction
    socket.on('unsubscribeAuction', (auctionId) => {
      socket.leave(`auction_${auctionId}`);
    });

    socket.on('getAuction', async (auctionId) => {
      try {
        const auction = await Auction.findById(auctionId);
        socket.emit('auctionData', auction);
      } catch (error) {
        socket.emit('error', 'Error fetching auction data');
      }
    });

    // Join the room for the auctions page
    socket.on('joinAuctionsPage', () => {
      socket.join('auctionsPage');
    });

    // Leave the room for the auctions page
    socket.on('leaveAuctionsPage', () => {
      socket.leave('auctionsPage');
    });

    socket.on('auctionsListChange', async () => {
      try {
        const auctions = await Auction.find().sort('-createdAt').limit(20);
        socket.emit('auctionsList', auctions);
      } catch (error) {
        socket.emit('error', 'Error fetching auctions list');
      }
    });

    socket.on('disconnect', () => {
      logger.info(`Public-Socket ${socket.id} Disconnected...`);
    });
  });
}

module.exports = publicSocket;