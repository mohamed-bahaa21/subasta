const Auction = require('@models/Auction.model')

async function searchOngoingAuctions() {
    try {
        const now = new Date();
        const auctions = await Auction.find({
            status: 'running',
            startTime: { $lte: now },
            endTime: { $gte: now }
        });
        return auctions;
    } catch (error) {
        throw new Error(607)
    }
}

async function searchCompletedAuctions() {
    try {
        const now = new Date();
        const auctions = await Auction.find({
            status: 'ended',
            endTime: { $lte: now }
        });
        return auctions;
    } catch (error) {
        throw new Error(608)
    }
}

async function searchAuctionsByKeyword(keyword) {
    try {
        const auctions = await Auction.find({
            $text: { $search: keyword }
        });
        return auctions;
    } catch (error) {
        throw new Error(609)
    }
}

async function searchAuctionsByStatus(status) {
    try {
        const auctions = await Auction.find({
            status: status
        });
        return auctions;
    } catch (error) {
        throw new Error(610)
    }
}

async function searchAuctionsByCategory(categoryId) {
    try {
        const auctions = await Auction.find({
            category: categoryId
        });
        return auctions;
    } catch (error) {
        throw new Error(611)
    }
}

async function searchAuctionsByTimeRange(startTime, endTime) {
    const auctions = await Auction.find({
        startTime: { $gte: startTime },
        endTime: { $lte: endTime }
    });
    return auctions;
}

module.exports = {
    searchOngoingAuctions,
    searchCompletedAuctions,
    searchAuctionsByKeyword,
    searchAuctionsByStatus,
    searchAuctionsByCategory,
    searchAuctionsByTimeRange
}