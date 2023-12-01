
export default async function sellerUploadCount(parent, args, context, info) {
    let { startDate, endDate, skip, limit, } = args;
    let { collections } = context
    let { Products } = collections;
    let sellerUploadCountPipeline = [
        {
            $match: {
                createdAt: {
                    $gte: startDate, // Start date
                    $lte: endDate, // End date
                },
            },
        },
        {
            $lookup: {
                from: "Accounts", // Replace with the actual name of the Accounts collection
                localField: "sellerId",
                foreignField: "_id",
                as: "sellerDetails",
            },
        },
        {
            $unwind: "$sellerDetails", // Unwind the array created by $lookup
        },
        {
            $project: {
                _id: 0, // Exclude the _id field if needed
                sellerId: 1,
                sellerName: "$sellerDetails.storeName",
                productCount: 1,
            },
        },
        {
            $group: {
                _id: "$sellerId",
                sellerName: { $first: "$sellerName" },
                productCount: { $sum: 1 },
            },
        },
        { $skip: skip }, // Skip the already fetched records
        { $limit: limit }, // Fetch the next set of results
    ]
    let sellerUploadCountResponse = await Products.aggregate(sellerUploadCountPipeline).toArray();
    // console.log("sellerUploadCountResponse", sellerUploadCountResponse);
    return sellerUploadCountResponse;
}

