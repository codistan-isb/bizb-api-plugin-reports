export default async function sellerUploadCount(parent, args, context, info) {
  let { startDate, endDate, skip, limit } = args;
  let { collections } = context;
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
        sellerLogo: "$sellerDetails.storeLogo",
        sellerEmail: "$sellerDetails.emails",
        sellerName: "$sellerDetails.storeName",
        sellerPhone: "$sellerDetails.profile",
        productCount: 1,
      },
    },
    {
      $unwind: "$sellerEmail", // Unwind the array created by $lookup
      
    },
    {
      $group: {
        _id: "$sellerId",
        sellerLogo: { $first: "$sellerLogo" },
        sellerEmail: { $first: "$sellerEmail.address" },
        sellerName: { $first: "$sellerName" },
        productCount: { $sum: 1 },
        sellerPhone: {$first:"$sellerPhone.phone"}

      },
    },
    { $skip: skip }, // Skip the already fetched records
    { $limit: limit }, // Fetch the next set of results
  ];
  // let totalcount = await Products.countDocuments(sellerUploadCountPipeline)
  // Remove $skip and $limit stages from the count pipeline
  let countPipeline = [
    ...sellerUploadCountPipeline.slice(0, -2), // Remove last two stages ($skip and $limit)
    { $count: "totalcount" },
  ];

  let countResult = await Products.aggregate(countPipeline).toArray();
  let totalcount = countResult.length > 0 ? countResult[0].totalcount : 0;

  let sellerUploadCountResponse = await Products.aggregate(
    sellerUploadCountPipeline
  ).toArray();
  console.log("sellerUploadCountResponse", sellerUploadCountResponse);
  return {
    totalcount: totalcount,
    sellerUploadProducts: sellerUploadCountResponse,
  };
}
