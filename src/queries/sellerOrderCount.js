
// export default async function sellerOrderCount(parent, args, context, info) {
//     // console.log("sellerOrderCount query args", args);
//     let { startDate, endDate, skip, limit, } = args;
//     let { collections } = context
//     let { SubOrders } = collections;
//     let sellerOrderCountPipeline = [
//         {
//             $match: {
//                 createdAt: {
//                     $gte: startDate,
//                     $lte: endDate,
//                 },
//             },
//         },
//         {
//             $lookup: {
//                 from: "Accounts",
//                 localField: "sellerId",
//                 foreignField: "_id",
//                 as: "sellerInfo",
//             },
//         },
//         {
//             $unwind: "$sellerInfo",
//         },
//         {
//             $unwind: "$payments"
//         },
//         {
//             $unwind: {
//                 path: "$shipping",
//                 preserveNullAndEmptyArrays: true
//             }
//         },
//         {
//             $unwind: {
//                 path: "$shipping.items",
//                 preserveNullAndEmptyArrays: true
//             }
//         },
//         {
//             $group: {
//                 _id: {
//                     subOrderID: "$_id",
//                     orderDate: "$createdAt",
//                     price: "$payments.amount",
//                     status: "$payments.status",
//                     title: "$shipping.items.title",
//                     sellerId: "$sellerId",
//                     storeName: "$sellerInfo.storeName",
//                     sellerLogo: "$sellerInfo.storeLogo",
//                     sellerEmail: "$sellerInfo.emails.address",
//                     sellerPhone: "$sellerInfo.profile"
//                 },
//                 orderCount: { $sum: 1 },
//             },
//         },
//         // {
//         //     $unwind: "$sellerEmail", 
//         // },
//         {
//             $project: {
//                 _id: 0,
//                 subOrderID: "$_id.subOrderID",
//                 orderDate: "$_id.orderDate",
//                 price: "$_id.price",
//                 status: "$_id.status",
//                 title: "$_id.title",
//                 sellerId: "$_id.sellerId",
//                 sellerLogo: "$_id.sellerLogo",
//                 sellerEmail: { $first: "$_id.sellerEmail" },
//                 storeName: "$_id.storeName",
//                 orderCount: 1,
//                 sellerPhone: "$_id.sellerPhone.phone"
//             },
//         },
//         { $skip: skip }, // Skip the already fetched records
//         { $limit: limit }, // Fetch the next set of results
//     ]


//     let countPipeline = [
//         ...sellerOrderCountPipeline.slice(0, -2), // Remove last two stages ($skip and $limit)
//         { $count: "totalcount" },
//     ];

//     let countResult = await SubOrders.aggregate(countPipeline).toArray();
//     let totalcount = countResult.length > 0 ? countResult[0].totalcount : 0;
//     let sellerOrderCountResponse = await SubOrders.aggregate(sellerOrderCountPipeline).toArray();
//     console.log("sellerOrderCountResponse", sellerOrderCountResponse);
//     return {
//         totalcount: totalcount,
//         sellerOrderCount: sellerOrderCountResponse
//     }
// }




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
        ...(childOrderId && { "_id": childOrderId }),
        ...(storeName && { "sellerId": storeName }),
        ...(orderStatus && { "payments.status": orderStatus }),
        ...(productId || productName ? { "shipping.items": { $elemMatch: { ...(productId && { "productId": productId }), ...(productName && { "title": productName }) } } } : {})
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
                as: "sellerInfo",
            },
        },
        {
            $unwind: "$sellerInfo",
        },
        {
            $unwind: "$payments"
        },
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
                    price: "$payments.amount",
                    status: "$payments.status",
                    title: "$shipping.items.title",
                    sellerId: "$sellerId",
                    storeName: "$sellerInfo.storeName",
                    sellerLogo: "$sellerInfo.storeLogo",
                    sellerEmail: "$sellerInfo.emails.address",
                    sellerPhone: "$sellerInfo.profile"
                },
                orderCount: { $sum: 1 },
            },
        },
        {
            $project: {
                _id: 0,
                subOrderID: "$_id.subOrderID",
                orderDate: "$_id.orderDate",
                price: "$_id.price",
                status: "$_id.status",
                title: "$_id.title",
                sellerId: "$_id.sellerId",
                sellerLogo: "$_id.sellerLogo",
                sellerEmail: { $first: "$_id.sellerEmail" },
                storeName: "$_id.storeName",
                orderCount: 1,
                sellerPhone: "$_id.sellerPhone.phone"
            },
        },
        { $skip: skip }, // Skip the already fetched records
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
