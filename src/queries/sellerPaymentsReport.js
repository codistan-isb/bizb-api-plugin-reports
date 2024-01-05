
export default async function sellerPaymentsReport(parent, args, context, info) {
    console.log("sellerOrderCount query args", args);
    let { startDate, endDate, skip, limit, paymentStatus, productId } = args;
    let { collections } = context;
    let { Payments, Accounts } = collections;
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

    // Find payments and perform a lookup on the "Accounts" table
    let paymentRecord = await Payments.aggregate([
        { $match: match },
        {
            $lookup: {
                from: 'Accounts',
                localField: 'sellerId',
                foreignField: '_id',
                as: 'sellerInfo'
            }
        },
        {
            $unwind: "$sellerInfo",
        },
        {
            $group: {
                _id: {
                    sellerId: "$sellerInfo.userId",
                    storeName: "$sellerInfo.storeName",
                    emails: "$sellerInfo.emails",
                    profile: "$sellerInfo.profile"
                },
                // Include all fields from Payments
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
    ]).toArray();

    console.log("paymentRecord", paymentRecord);

    return {
        totalcount: total_count,
        PaymentRecord: paymentRecord,
    }
}
