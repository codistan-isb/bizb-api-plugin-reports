export default async function ordersStatusReport(parent, args, context, info) {
  // console.log("sellerOrderCount query args", args);
  let { startDate, endDate, skip, limit, orderStatus, byStores, byProduct, byStoreName, customerName, customerContact, productTitile } =
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

  if (customerName) {
    match["shipping.address.fullName"] = customerName;
  }

  if (customerContact) {
    match["shipping.address.phone"] = customerContact
  }

  if (productTitile) {
    match["shipping.items.title"] = productTitile
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
      $unwind: "$shipping"
    },
    { $unwind: "$shipping.items" },
    {
      $group: {
        _id: {
          subOrderId: "$_id",
          createdAt: "$createdAt",
          customerEmail: "$email",
          status: "$payments.status",
          price: "$payments.amount",
          customerName: "$shipping.address.fullName",
          customerContact: "$shipping.address.phone",
          title: "$shipping.items.title",
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
        customerEmail: "$_id.customerEmail",
        status: "$_id.status",
        price: "$_id.price",
        customerName: "$_id.customerName",
        customerContact: "$_id.customerContact",
        productTitile: "$_id.title",
        sellerId: "$_id.sellerId",
        sellernName: "$_id.sellernName",
        storeName: "$_id.storeName",
        productCount: 1,
        sellerLogo: "$_id.sellerLogo",
        sellerEmail: { $first: "$_id.sellerEmail" },
        sellerPhone: "$_id.sellerPhone.phone"
      },
    },
    { $skip: skip },
    { $limit: limit },

  ];

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
