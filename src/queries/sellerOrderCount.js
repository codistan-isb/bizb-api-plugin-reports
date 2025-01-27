
export default async function sellerOrderCount(parent, args, context, info) {
    let { startDate, endDate, skip, limit, childOrderId, storeName, productId, productName, orderStatus } = args;
    let { collections } = context;
    let { SubOrders } = collections;

    // Create a dynamic match object based on the provided arguments
    let matchCriteria = {
        createdAt: {
            $gte: startDate,
            $lte: endDate
        },
        // Additional filters
        ...(childOrderId && { "internalOrderId": childOrderId }),
        ...(storeName && { "sellerId": storeName }),
        ...(orderStatus && { "payments.status": orderStatus }),
        ...(productId || productName ? { "shipping.items": { $elemMatch: { ...(productName && { "title": productName }) } } } : {})
    };

    let sellerOrderCountPipeline = [
        {
            $match: matchCriteria
        },
        {
            $lookup: {
                from: "Accounts",
                localField: "sellerId",
                foreignField: "_id",
                as: "sellerInfo"
            }
        },
        { $unwind: "$sellerInfo" },
        { $unwind: "$payments" },
        {
            $unwind: {
                path: "$shipping",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $unwind: {
                path: "$shipping.items",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $group: {
                _id: {
                    subOrderID: "$_id",
                    orderDate: "$createdAt",
                    childOrderId: "$internalOrderId",
                    price: "$payments.amount",
                    status: "$payments.status",
                    prodTitle: "$shipping.items.title",
                    sellerId: "$sellerId",
                    storeName: "$sellerInfo.storeName",
                    sellerLogo: "$sellerInfo.storeLogo",
                    sellerEmail: "$sellerInfo.emails.address",
                    sellerPhone: "$sellerInfo.profile"
                },
                orderCount: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                subOrderID: "$_id.subOrderID",
                childOrderId: "$_id.childOrderId",
                orderDate: "$_id.orderDate",
                price: "$_id.price",
                status: "$_id.status",
                prodTitle: "$_id.prodTitle",
                sellerId: "$_id.sellerId",
                sellerLogo: "$_id.sellerLogo",
                sellerEmail: { $first: "$_id.sellerEmail" },
                storeName: "$_id.storeName",
                orderCount: 1,
                sellerPhone: "$_id.sellerPhone.phone"
            }
        },
        {
            $lookup: {
                from: "Products",
                localField: "productId",
                foreignField: "_id",
                as: "productInfo"
            }
        },
        { $unwind: "$productInfo" },

        // ADD FILTER ON THE PRODUCT TABLE ON THE BASIS OF THE REFERENCES
        ...(productId ? [{ $match: { "productInfo.referenceId": productId } }] : []),

        { $skip: skip },
        { $limit: limit } // Fetch the next set of results
    ];




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
        sellerOrderCount: sellerOrderCountResponse
    };
}
