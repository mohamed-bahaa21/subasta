const {
    searchAuctionsByKeyword,
    searchAuctionsByStatus,
    searchAuctionsByCategory,
    searchAuctionsByTimeRange,
    searchOngoingAuctions,
} = require('@services/first/public/search.public.service')


async function searchAuctions(req, res, next) {
    try {
        const { q, status, keyword, category, start, end } = req.query;
        // -- BEGIN: I chose to use validators as middlewares for routes to apply more separation of concerns.
        // Validate
        // const query = req.query;
        // const { error, value } = searchAuctionsValidation.validate(query);
        // if (error || value == undefined) return res.status(400).json({ message: error.message });
        // -- END:

        let auctions;

        if (q) {
            auctions = await searchAuctionsByKeyword(q);
        } else if (status) {
            auctions = await searchAuctionsByStatus(status);
        } else if (category) {
            auctions = await searchAuctionsByCategory(category);
        } else if (start && end) {
            auctions = await searchAuctionsByTimeRange(start, end);
        } else {
            auctions = await searchOngoingAuctions(start, end);
        }

        res.status(200).json({ auctions });
    } catch (error) {
        next(error);
    }
};

module.exports = { searchAuctions }


// 2nd Approach ========================================
async function second__searchAuctions({ keyword, category, status, startAfter, endBefore }) {
    let query = Auction.find();

    if (keyword) {
        query = searchByKeyword(query, keyword);
    }

    if (category) {
        query = searchByCategory(query, category);
    }

    if (status) {
        query = searchByStatus(query, status);
    }

    if (startAfter) {
        query = searchByStartAfter(query, startAfter);
    }

    if (endBefore) {
        query = searchByEndBefore(query, endBefore);
    }

    const auctions = await query.exec();
    return auctions;
}

function searchByKeyword(query, keyword) {
    return query.or([
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
    ]);
}

function searchByCategory(query, category) {
    return query.where({ category });
}

function searchByStatus(query, status) {
    return query.where({ status });
}

function searchByStartAfter(query, startAfter) {
    return query.where('startTime').gt(startAfter);
}

function searchByEndBefore(query, endBefore) {
    return query.where('endTime').lt(endBefore);
}