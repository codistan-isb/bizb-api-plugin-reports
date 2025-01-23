export default async function returnToSellerProducts(
  parent,
  args,
  context,
  info
) {
  let { startDate, endDate, skip, limit, storeName, productName, productID, referenceId } = args;
  let { collections } = context;
  let { SubOrders } = collections;

  let match = {};
  if (startDate && endDate) {
    match.createdAt = {
      $gte: startDate,
      $lte: endDate,
    };
  }
  match["shipping.items.workflow.status"] = "New".toLowerCase().replace(/_/g, "");

  let basePipeline = [
    {
      $match: match,
    },
    {
      $lookup: {
        from: "SubOrders",
        localField: "_id",
        foreignField: "_id",
        as: "suborders",
      },
    },
    { $unwind: "$suborders" },
    { $unwind: "$suborders.shipping" },
    { $unwind: "$suborders.shipping.items" },
    {
      $match: {
        "suborders.shipping.items.productId": {
          $exists: true,
        },
      },
    },
    {
      $lookup: {
        from: "Accounts",
        localField: "suborders.sellerId",
        foreignField: "_id",
        as: "sellerInfo",
      },
    },
    { $unwind: "$sellerInfo" },
    {
      $lookup: {
        from: "Products",
        localField: "suborders.shipping.items.productId",
        foreignField: "_id",
        as: "productInfo",
      },
    },
    { $unwind: "$productInfo" },
  ];

  let filterStages = [];

  if (storeName) {
    filterStages.push({
      $match: {
        "sellerInfo.storeName": { $regex: storeName, $options: "i" },
      },
    });
  }

  if (productID) {
    filterStages.push({
      $match: {
        "productInfo.referenceId": productID,
      },
    });
  }

  if (productName) {
    filterStages.push({
      $match: {
        "productInfo.title": { $regex: productName, $options: "i" },
      },
    });
  }

  let returnToSellerProductsPipeline = [
    ...basePipeline,
    ...filterStages,
    {
      $project: {
        _id: 0,
        sellerId: "$suborders.sellerId",
        productId: "$suborders.shipping.items.productId",
        updatedAt: "$suborders.updatedAt",
        sellerInfo: "$sellerInfo",
        productInfo: "$productInfo",
      },
    },
    { $skip: skip },
    { $limit: limit },
  ];

  let countPipeline = [...basePipeline, ...filterStages, { $count: "totalcount" }];

  let result = await SubOrders.aggregate(returnToSellerProductsPipeline).toArray();

  let countResult = await SubOrders.aggregate(countPipeline).toArray();
  let totalcount = countResult.length > 0 ? countResult[0].totalcount : 0;

  return {
    totalcount: totalcount,
    returnToSellerProductsReturn: result,
  };
}