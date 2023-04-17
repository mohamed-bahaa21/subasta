let mongoose = require('mongoose');
let ObjectId = mongoose.Schema.Types.ObjectId
const Auction = require('@models/Auction.model')

async function searchOngoingAuctions(start, end) {
    try {
        const now = new Date();
        const auctions = await Auction.find({
            status: 'running',
            startingDate: { $lte: start },
            endingDate: { $gte: end }
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
            status: 'completed',
            endingDate: { $lte: now }
        });
        return auctions;
    } catch (error) {
        throw new Error(608)
    }
}

async function searchAuctionsByStatus(status) {
    try {
        const auctions = await Auction.find({ status: status });
        return auctions;
    } catch (error) {
        console.log('====================================');
        console.log(error);
        console.log('====================================');
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

async function searchAuctionsByTimeRange(startingDate, endingDate) {
    try {
        const auctions = await Auction.find({
            startingDate: { $gte: startingDate },
            endingDate: { $lte: endingDate }
        });
        return auctions;
    } catch (error) {
        throw new Error(612)
    }
}

async function searchAuctionsByKeyword(auctionModel, keyword) {
    try {
        // const auctions = await Auction.find({ $text: { $search: keyword } });
        // const regex = new RegExp(keyword, 'i');
        const auctions = await Auction.find({
            $or: [
                { name: { $regex: regex } },
                { description: { $regex: regex } },
            ],
        });
        // const auctions = await Auction.find({ text: { $regex: keyword } });
        // const auctions = await auctionModel.find(
        //     { $text: { $search: keyword } },
        //     { score: { $meta: 'textScore' }, name: 1, description: 1 }
        // );
        // const auctions = await auctionModel.find({ $text: { $search: `"${keyword}"` } });
        return auctions;
    } catch (error) {
        throw new Error(609)
    }
}

module.exports = {
    searchOngoingAuctions,
    searchCompletedAuctions,
    searchAuctionsByKeyword,
    searchAuctionsByStatus,
    searchAuctionsByCategory,
    searchAuctionsByTimeRange
}