export default async function soldProductsMonthly(parent, args, context, info) {
    let { startDate, endDate, skip, limit, storeName, category} = args;
    let { collections } = context;
    let { SimpleInventory, Products, Accounts } = collections;

    let match = {
        inventoryInStock: 0
    };

    if (startDate && endDate) {
        match.updatedAt = {
            $gte: startDate,
            $lte: endDate
        };
    }

    let aggregationPipeline = [
        {
            $match: {
                $and: [
                    match,
                    { "productConfiguration.productId": { $exists: true, $ne: null } }
                ]
            }
        },
        {
            $lookup: {
                from: "Products", // Assuming the name of your products collection is "Products"
                localField: "productConfiguration.productId", // Adjusted to use the correct field
                foreignField: "_id",
                as: "productInfo"
            }
        },
        { $unwind: "$productInfo" }, // Unwind the array produced by the $lookup stage
        {
            $lookup: {
                from: "Accounts", // Assuming the name of your accounts collection is "Accounts"
                localField: "productInfo.sellerId", // Adjusted to use the correct field
                foreignField: "_id",
                as: "sellerInfo"
            }
        },
        { $unwind: "$sellerInfo" }, // Unwind the array produced by the $lookup stage
        { $skip: skip },
        { $limit: limit }
        

    ];
    if (storeName) {
        console.log("Applying storeName filter:", storeName); // Log storeName
        aggregationPipeline = [
            {
                $match: {
                    $and: [
                        match,
                        { "productConfiguration.productId": { $exists: true, $ne: null } }
                    ]
                }
            },
            {
                $lookup: {
                    from: "Products", // Assuming the name of your products collection is "Products"
                    localField: "productConfiguration.productId", // Adjusted to use the correct field
                    foreignField: "_id",
                    as: "productInfo"
                }
            },
            { $unwind: "$productInfo" }, // Unwind the array produced by the $lookup stage
            {
                $lookup: {
                    from: "Accounts", // Assuming the name of your accounts collection is "Accounts"
                    localField: "productInfo.sellerId", // Adjusted to use the correct field
                    foreignField: "_id",
                    as: "sellerInfo"
                }
            },
            { $unwind: "$sellerInfo" }, // Unwind the array produced by the $lookup stage
            {
                $match: {
                    "sellerInfo.storeName": storeName
                }
            },
            { $skip: skip },
            { $limit: limit }
        ];
    }
    if (category) {
        console.log("Applying storeName filter:", storeName); // Log storeName
        aggregationPipeline = [
            {
                $match: {
                    $and: [
                        match,
                        { "productConfiguration.productId": { $exists: true, $ne: null } }
                    ]
                }
            },
            {
                $lookup: {
                    from: "Products", // Assuming the name of your products collection is "Products"
                    localField: "productConfiguration.productId", // Adjusted to use the correct field
                    foreignField: "_id",
                    as: "productInfo"
                }
            },
            { $unwind: "$productInfo" }, // Unwind the array produced by the $lookup stage
            {
                $match: {
                    "productInfo.metafields.key": "category",
                    "productInfo.metafields.value": category
                }
            },
            {
                $lookup: {
                    from: "Accounts", // Assuming the name of your accounts collection is "Accounts"
                    localField: "productInfo.sellerId", // Adjusted to use the correct field
                    foreignField: "_id",
                    as: "sellerInfo"
                }
            },
            { $unwind: "$sellerInfo" }, // Unwind the array produced by the $lookup stage
            { $skip: skip },
            { $limit: limit }
           
        ];
    }

    let soldProductsMonthly = await SimpleInventory.aggregate(aggregationPipeline).toArray();

    let total_count = await SimpleInventory.count(match);

    console.log("soldProductsMonthly", soldProductsMonthly);
    soldProductsMonthly.forEach(soldProduct => {
        // Assuming 'price' is a field in the productInfo object
        const productPrice = soldProduct.productInfo.price;
        console.log("Product Price:", productPrice);
    });

    return {
        totalcount: total_count,
        soldProducts: soldProductsMonthly.map(product => ({
            ...product,
            productInfo: [product.productInfo], // Ensure productInfo is returned as an array
            sellerInfo: [product.sellerInfo] // Ensure sellerInfo is returned as an array
        }))
    };
}
