const Auctions = require('@models/Auction.model')

const Logger = require('../../third/winston/winston.service');
const logger = new Logger('auctions.public.service');

async function getAuctionsAggregationSets(filter, sort, page, limit, auction_status, q) {
    var pageNum = parseInt(page, 10) || 1;
    var limitNumber = parseInt(limit, 10) || 10;

    var filterCriteria = { status: `${auction_status}`, ...JSON.parse(filter || "{}") };
    var searchQuery = q ? { $text: { $search: q } } : {};
    var sortCriteria = sort ? { [sort.split(":")[0]]: sort.split(":")[1] === "desc" ? -1 : 1 } : {};
    var skip = (pageNum - 1) * limitNum;

    return {
        filterCriteria,
        searchQuery,
        sortCriteria,
        skip,
        pageNum,
        limitNumber,
    }
}

async function queryAuctions(filterCriteria, searchQuery, sortCriteria, skip, pageNumber, limitNumber) {
    try {
        const [auctions, totalAuctionsNumber] = await Promise.all([
            Auctions.find({ ...filterCriteria, ...searchQuery })
                .sort(sortCriteria)
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Auctions.countDocuments({ ...filterCriteria, ...searchQuery })
        ]);

        return {
            auctions,
            totalAuctionsNumber,
            pageNumber: pageNumber,
            totalPagesNumber: Math.ceil(total / limitNumber)
        }
    } catch (err) {
        logger.error(err);
        throw new Error(600);
    }
}


async function findAuctionById(auctionId) {
    try {
        let auction = await Auctions.findOne({ _id: auctionId });
        return auction || null;
    } catch (error) {
        throw new Error(601);
    }
}

module.exports = { getAuctionsAggregationSets, queryAuctions, findAuctionById }