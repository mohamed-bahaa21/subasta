const AuctionPublicHelper = require('@helpers/public/auctions.public.helper')
const { getAuctionsAggregationSets, queryAuctions, findAuctionById } = require('@services/first/public/auctions.public.service')


// GET running auctions (filter, search, sort, pagination)
// GET upcoming auctions (Filter, sort, pagination, and search)
async function getAuctionsQuery(req, res, next) {
    const { filter, sort, page, limit, q, auction_status } = req.query;
    try {
        let { filterCriteria, searchQuery, sortCriteria, skip, pageNum, limitNumber } = await getAuctionsAggregationSets(filter, sort, page, limit, auction_status, q)
        let { auctions, totalAuctionsNumber, pageNumber, totalPages } = await queryAuctions(filterCriteria, searchQuery, sortCriteria, skip, pageNum, limitNumber);

        res.json({
            auctions,
            totalAuctionsNumber,
            pageNumber: pageNumber,
            totalPages: totalPages
        });
    } catch (error) {
        // res.status(500).json({ message: "Internal server error" });
        next(error);
    }
}

async function getAuctionById(req, res, next) {
    const auctionId = req.params.id;
    try {
        let auction = await findAuctionById(auctionId)
        res.status(200).json({ auction })

    } catch (error) {
        next(error)
    }
}

module.exports = {
    getAuctionsQuery,
    getAuctionById,
}