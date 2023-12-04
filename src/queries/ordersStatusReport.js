
export default async function ordersStatusReport(parent, args, context, info) {
    // console.log("sellerOrderCount query args", args);
    let { startDate, endDate, skip, limit, orderStatus, byStores, byProduct } = args;
    let { collections } = context
    let { SubOrders } = collections;
    let match = {};
    if (startDate && endDate) {
        match.createdAt = {
            $gte: startDate,
            $lte: endDate
        };
    }
    if (orderStatus) {
        match['shipping.items.workflow.status'] = orderStatus.toLowerCase().replace(/_/g, '');
    }
    if (byStores) {
        match['shipping.items.sellerId'] = byStores;
    }
    if (byProduct) {
        match['shipping.items.productId'] = byProduct;
    }
    console.log("match", match);
    let ordersStatusReportPipeline = [
        // {
        //     $match: {
        //         createdAt: {
        //             $gte: startDate,
        //             $lte: endDate,
        //         },
        //         'shipping.items.workflow.status': orderStatus.toLowerCase().replace(/_/g, '')
        //     },
        // },
        {
            $match: match
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
                productCount: { $sum: 1 },
            },
        },
        {
            $project: {
                _id: 0,
                sellerId: "$_id.sellerId",
                storeName: "$_id.storeName",
                productCount: 1,
            },
        },
        { $skip: skip }, // Skip the already fetched records
        { $limit: limit }, // Fetch the next set of results
    ]
    console.log("ordersStatusReportPipeline", ordersStatusReportPipeline);
    let ordersStatusReportResp = await SubOrders.aggregate(ordersStatusReportPipeline).toArray();
    console.log("ordersStatusReportResp", ordersStatusReportResp);
    return ordersStatusReportResp;
}

