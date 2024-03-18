export default async function returnToSellerProducts(
  parent,
  args,
  context,
  info
) {
  // console.log("sellerOrderCount query args", args);
  let { startDate, endDate, skip, limit, storeName } = args;
  let { collections } = context;
  let { SubOrders, Products } = collections;

  let match = {};
  if (startDate && endDate) {
    match.createdAt = {
      $gte: startDate,
      $lte: endDate,
    };
  }
  match["shipping.items.workflow.status"] = "New"
    .toLowerCase()
    .replace(/_/g, "");

 

  let returnToSellerProductsPipeline = [

    {
      $match: match,
    },
    {
      $lookup: {
        from: "SubOrders",
        localField: "_id",
        foreignField: "_id",
        as: "suborders"
      }
    },
    {
      $unwind: "$suborders"
    },
    {
      $unwind: "$suborders.shipping"
    },
    {
      $unwind: "$suborders.shipping.items"
    },
    {
      $match: {
        "suborders.shipping.items.productId": {
          $exists: true
        }
      }
    },
    {
      $lookup: {
          from: 'Accounts',
          localField: 'suborders.sellerId',
          foreignField: '_id',
          as: 'sellerInfo'
      }
  },
  { $unwind: "$sellerInfo" },
    {
      $project: {
        _id: 0,
        sellerId: "$suborders.sellerId",
        productId: "$suborders.shipping.items.productId",
        updatedAt: "$suborders.updatedAt", // Include updatedAt field
        sellerInfo: "$sellerInfo"

      }
    },
    { $skip: skip }, // Skip the already fetched records
    { $limit: limit }, // Fetch the next set of results
  ];

  if (storeName) {
    console.log("Applying storeName filter:", storeName); // Log storeName
    returnToSellerProductsPipeline = [

      {
        $match: match,
      },
      {
        $lookup: {
          from: "SubOrders",
          localField: "_id",
          foreignField: "_id",
          as: "suborders"
        }
      },
      {
        $unwind: "$suborders"
      },
      {
        $unwind: "$suborders.shipping"
      },
      {
        $unwind: "$suborders.shipping.items"
      },
      {
        $match: {
          "suborders.shipping.items.productId": {
            $exists: true
          }
        }
      },
      {
        $lookup: {
            from: 'Accounts',
            localField: 'suborders.sellerId',
            foreignField: '_id',
            as: 'sellerInfo'
        }
    },
    { $unwind: "$sellerInfo" },
    {
      $match: {
          "sellerInfo.storeName": storeName
      }
  },
      {
        $project: {
          _id: 0,
          sellerId: "$suborders.sellerId",
          productId: "$suborders.shipping.items.productId",
          updatedAt: "$suborders.updatedAt", // Include updatedAt field
          sellerInfo: "$sellerInfo"
  
        }
      },
      { $skip: skip }, // Skip the already fetched records
      { $limit: limit }, // Fetch the next set of results
    ];
}



  let result = await SubOrders.aggregate(returnToSellerProductsPipeline).toArray();


  let countPipeline = [
    ...returnToSellerProductsPipeline.slice(0, -2), // Remove last two stages ($skip and $limit)
    { $count: "totalcount" },
  ];

  let countResult = await SubOrders.aggregate(countPipeline).toArray();
  let totalcount = countResult.length > 0 ? countResult[0].totalcount : 0;


  console.log("Products:", result);




  return {
    totalcount: totalcount,
    returnToSellerProductsReturn: result,
  };
}