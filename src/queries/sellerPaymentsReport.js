export default async function sellerPaymentsReport(parent, args, context, info) {
    console.log("sellerOrderCount query args", args);
    let { startDate, endDate, skip, limit, paymentStatus, productId, storeName , productName} = args;
    let { collections } = context;
    let { Payments, Accounts, Products } = collections; // Assuming you have a Products collection
    let match = {};
    
    if (startDate && endDate) {
        match.createdAt = {
            $gte: startDate,
            $lte: endDate
        };
    }
    if (paymentStatus) {
        match['status'] = paymentStatus;
    }
    if (productId) {
        match['productId'] = productId;
    }
    console.log("match", match);

    // Count the total documents
    let total_count = await Payments.countDocuments(match);
    console.log("total_count", total_count);

    // Define stages for aggregation pipeline
    let aggregationStages = [
        { $match: match },
        {
            $lookup: {
                from: 'Accounts',
                localField: 'sellerId',
                foreignField: '_id',
                as: 'sellerInfo'
            }
        },
        { $unwind: "$sellerInfo" }, // Deconstruct the sellerInfo array
        {
            $lookup: {
                from: 'Products',
                localField: 'productId',
                foreignField: '_id',
                as: 'productInfo'
            }
        },
        { $unwind: "$productInfo" }, // Deconstruct the productInfo array
        {
            $group: {
                _id: {
                    sellerId: "$sellerInfo.userId",
                    storeName: "$sellerInfo.storeName",
                    emails: "$sellerInfo.emails",
                    profile: "$sellerInfo.profile",
                    productId: "$productInfo._id", // Group by productId
                    productName: "$productInfo.title" // Include product title
                },
                paymentFields: { $first: "$$ROOT" }
            },
        },
        {
            $replaceRoot: {
                newRoot: {
                    $mergeObjects: ["$paymentFields", "$_id"]
                }
            }
        },
        { $skip: skip },
        { $limit: limit }
    ];

    // Conditionally add $match stage for storeName filter
    if (storeName) {
        console.log("Applying storeName filter:", storeName); // Log storeName
        aggregationStages = [
            { $match: match },
            {
                $lookup: {
                    from: 'Accounts',
                    localField: 'sellerId',
                    foreignField: '_id',
                    as: 'sellerInfo'
                }
            },
            { $unwind: "$sellerInfo" }, // Deconstruct the sellerInfo array
            {
                $match: {
                    "sellerInfo.storeName": storeName
                }
            },
            {
                $lookup: {
                    from: 'Products',
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            { $unwind: "$productInfo" }, // Deconstruct the productInfo array
            {
                $group: {
                    _id: {
                        sellerId: "$sellerInfo.userId",
                        storeName: "$sellerInfo.storeName",
                        emails: "$sellerInfo.emails",
                        profile: "$sellerInfo.profile",
                        productId: "$productInfo._id", // Group by productId
                        productName: "$productInfo.title" // Include product title
                    },
                    paymentFields: { $first: "$$ROOT" }
                },
            },
            {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: ["$paymentFields", "$_id"]
                    }
                }
            },
            { $skip: skip },
            { $limit: limit }
        ];
    }
    if (productName) {
        console.log("Applying storeName filter:", productName); // Log storeName
        aggregationStages = [
            { $match: match },
            {
                $lookup: {
                    from: 'Accounts',
                    localField: 'sellerId',
                    foreignField: '_id',
                    as: 'sellerInfo'
                }
            },
            { $unwind: "$sellerInfo" }, // Deconstruct the sellerInfo array
            {
                $lookup: {
                    from: 'Products',
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            { $unwind: "$productInfo" }, // Deconstruct the productInfo array
            {
                $match: {
                    "productInfo.title": productName
                }
            },
            {
                $lookup: {
                    from: 'Products',
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            { $unwind: "$productInfo" }, // Deconstruct the productInfo array
            {
                $group: {
                    _id: {
                        sellerId: "$sellerInfo.userId",
                        storeName: "$sellerInfo.storeName",
                        emails: "$sellerInfo.emails",
                        profile: "$sellerInfo.profile",
                        productId: "$productInfo._id", // Group by productId
                        productName: "$productInfo.title" // Include product title
                    },
                    paymentFields: { $first: "$$ROOT" }
                },
            },
            {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: ["$paymentFields", "$_id"]
                    }
                }
            },
            { $skip: skip },
            { $limit: limit }
        ];
    }
    // Perform aggregation query
    let paymentRecord = await Payments.aggregate(aggregationStages).toArray();

    console.log("paymentRecord", paymentRecord);

    return {
        totalcount: total_count,
        PaymentRecord: paymentRecord,
    }
}
