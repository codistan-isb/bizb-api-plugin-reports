
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
                    sellerLogo: "$sellerInfo.storeLogo",
                    sellerEmail: "$sellerInfo.emails.address" ,
                    sellerPhone: "$sellerInfo.profile"
                },
                orderCount: { $sum: 1 },
            },
        },
        // {
        //     $unwind: "$sellerEmail", // Unwind the array created by $lookup
        // },
        {
            $project: {
                _id: 0,
                sellerId: "$_id.sellerId",
                sellerLogo: "$_id.sellerLogo",
                sellerEmail: { $first: "$_id.sellerEmail" },
                storeName: "$_id.storeName",
                orderCount: 1,
                sellerPhone: "$_id.sellerPhone.phone"
            },
        },
        { $skip: skip }, // Skip the already fetched records
        { $limit: limit }, // Fetch the next set of results
    ]


    let countPipeline = [
        ...sellerOrderCountPipeline.slice(0, -2), // Remove last two stages ($skip and $limit)
        { $count: "totalcount" },
      ];
    
      let countResult = await SubOrders.aggregate(countPipeline).toArray();
      let totalcount = countResult.length > 0 ? countResult[0].totalcount : 0;
    let sellerOrderCountResponse = await SubOrders.aggregate(sellerOrderCountPipeline).toArray();
    console.log("sellerOrderCountResponse", sellerOrderCountResponse);
    return {
        totalcount: totalcount,
        sellerOrderCount: sellerOrderCountResponse}
}

