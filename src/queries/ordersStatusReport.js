export default async function ordersStatusReport(parent, args, context, info) {
  // console.log("sellerOrderCount query args", args);
  let { startDate, endDate, skip, limit, orderStatus, byStores, byProduct, byStoreName } =
    args;
  let { collections } = context;
  let { SubOrders } = collections;
  let match = {};
  if (startDate && endDate) {
    match.createdAt = {
      $gte: startDate,
      $lte: endDate,
    };
  }
  if (orderStatus) {
    match["shipping.items.workflow.status"] = orderStatus
      .toLowerCase()
      .replace(/_/g, "");
  }
  if (byStores) {
    match["shipping.items.sellerId"] = byStores;
  }
  if (byProduct) {
    match["shipping.items.productId"] = byProduct;
  }
  if (byStoreName) {
    match["shipping.items.productVendor"] = byStoreName;
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
      $match: match,
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
      $group: {
        _id: {
          subOrderId: "$_id",
          createdAt: "$createdAt",
          status: "$payments.status",
          price: "$payments.amount",
          sellerId: "$sellerId",
          storeName: "$sellerInfo.storeName",
          sellernName: "$sellerInfo.name",
          sellerLogo: "$sellerInfo.storeLogo",
          sellerEmail: "$sellerInfo.emails.address",
          sellerPhone: "$sellerInfo.profile",
        },
        productCount: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        subOrderId: "$_id.subOrderId",
        createdAt: "$_id.createdAt",
        status: "$_id.status",
        price: "$_id.price",
        sellerId: "$_id.sellerId",
        sellernName: "$_id.sellernName",
        storeName: "$_id.storeName",
        productCount: 1,
        sellerLogo: "$_id.sellerLogo",
        sellerEmail: { $first: "$_id.sellerEmail" },
        sellerPhone: "$_id.sellerPhone.phone"
      },
    },
    { $skip: skip }, // Skip the already fetched records
    { $limit: limit }, // Fetch the next set of results
  ];
  // console.log("ordersStatusReportPipeline", ordersStatusReportPipeline);
  let countPipeline = [
    ...ordersStatusReportPipeline.slice(0, -2), // Remove last two stages ($skip and $limit)
    { $count: "totalcount" },
  ];

  let countResult = await SubOrders.aggregate(countPipeline).toArray();
  let totalcount = countResult.length > 0 ? countResult[0].totalcount : 0;
  let ordersStatusReportResp = await SubOrders.aggregate(
    ordersStatusReportPipeline
  ).toArray();
  // console.log("ordersStatusReportResp", ordersStatusReportResp);
  return {
    totalcount: totalcount,
    ordersStatusReport: ordersStatusReportResp,
  };
}
