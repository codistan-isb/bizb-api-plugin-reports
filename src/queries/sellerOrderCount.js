
export default async function sellerOrderCount(parent, args, context, info) {
    // console.log("sellerOrderCount query args", args);
    let { startDate, endDate, skip, limit, } = args;
    let { collections } = context
    let { SubOrders } = collections;
    let sellerOrderCountPipeline = [
        {
            $match: {
                createdAt: {
                    $gte: startDate,
                    $lte: endDate,
                },
            },
        },
        {
            $lookup: {
                from: "Accounts",
                localField: "sellerId",
                foreignField: "_id",
                as: "sellerInfo",
            },
        },
        {
            $unwind: "$sellerInfo",
        },
        {
            $group: {
                _id: {
                    sellerId: "$sellerId",
                    storeName: "$sellerInfo.storeName",
                },
                orderCount: { $sum: 1 },
            },
        },
        {
            $project: {
                _id: 0,
                sellerId: "$_id.sellerId",
                storeName: "$_id.storeName",
                orderCount: 1,
            },
        },
        { $skip: skip }, // Skip the already fetched records
        { $limit: limit }, // Fetch the next set of results
    ]
    let sellerOrderCountResponse = await SubOrders.aggregate(sellerOrderCountPipeline).toArray();
    // console.log("sellerOrderCountResponse", sellerOrderCountResponse);
    return sellerOrderCountResponse;
}

