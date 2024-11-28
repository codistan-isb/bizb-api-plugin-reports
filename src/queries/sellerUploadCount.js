
// export default async function sellerUploadCount(parent, args, context, info) {
//   let { startDate, endDate, skip, limit, storeName, hashtagIds } = args;
//   let { collections } = context;
//   let { Products } = collections;

//   let sellerUploadCountPipeline = [
//     {
//       $match: {
//         $or: [
//           { // Date and hashtag filter
//             createdAt: {
//               $gte: startDate,
//               $lte: endDate
//             },
//             ...(hashtagIds && hashtagIds.length > 0 ? { hashtags: { $in: hashtagIds } } : {})
//           },
//           { // Store name filter without date restriction
//             "sellerDetails.storeName": storeName
//           }
//         ]
//       },
//     },
//     {
//       $lookup: {
//         from: "Accounts",
//         localField: "sellerId",
//         foreignField: "_id",
//         as: "sellerDetails",
//       },
//     },
//     {
//       $unwind: "$sellerDetails",
//     },
//     ...(storeName ? [
//       {
//         $match: {
//           "sellerDetails.storeName": storeName,
//         },
//       }
//     ] : []),
//     {
//       $project: {
//         _id: 0,
//         sellerId: 1,
//         sellerLogo: "$sellerDetails.storeLogo",
//         sellerEmail: "$sellerDetails.emails",
//         sellerName: "$sellerDetails.storeName",
//         sellerPhone: "$sellerDetails.profile",
//         productCount: 1,
//         productTitle: "$title",
//         hashtags: "$hashtags",
//       },
//     },
//     {
//       $unwind: "$sellerEmail",
//     },
//     {
//       $group: {
//         _id: "$sellerId",
//         sellerLogo: { $first: "$sellerLogo" },
//         sellerEmail: { $first: "$sellerEmail.address" },
//         sellerName: { $first: "$sellerName" },
//         productCount: { $sum: 1 },
//         sellerPhone: { $first: "$sellerPhone.phone" },
//         productTitles: { $push: "$productTitle" },
//         hashtags: { $push: "$hashtags" },
//       },
//     },
//     {
//       $project: {
//         sellerId: "$_id",
//         sellerLogo: 1,
//         sellerEmail: 1,
//         sellerName: 1,
//         productCount: 1,
//         sellerPhone: 1,
//         productTitles: 1,
//         hashtags: {
//           $reduce: {
//             input: "$hashtags",
//             initialValue: [],
//             in: { $concatArrays: ["$$value", "$$this"] },
//           },
//         },
//       },
//     },
//     {
//       $lookup: {
//         from: "Tags",
//         localField: "hashtags",
//         foreignField: "_id",
//         as: "hashtagDetails",
//       },
//     },
//     {
//       $project: {
//         sellerId: 1,
//         sellerLogo: 1,
//         sellerEmail: 1,
//         sellerName: 1,
//         productCount: 1,
//         sellerPhone: 1,
//         productTitles: 1,
//         hashtags: {
//           $map: {
//             input: "$hashtagDetails",
//             as: "hashtag",
//             in: {
//               id: "$$hashtag._id",
//               slug: "$$hashtag.slug"
//             }
//           }
//         }
//       },
//     }
//   ];

//   // Add skip and limit stages
//   sellerUploadCountPipeline.push({ $skip: skip }, { $limit: limit });

//   // Count pipeline (excluding $skip and $limit)
//   let countPipeline = [
//     ...sellerUploadCountPipeline.slice(0, -2),
//     { $count: "totalcount" },
//   ];

//   let countResult = await Products.aggregate(countPipeline).toArray();
//   let totalcount = countResult.length > 0 ? countResult[0].totalcount : 0;

//   let sellerUploadCountResponse = await Products.aggregate(
//     sellerUploadCountPipeline
//   ).toArray();

//   return {
//     totalcount: totalcount,
//     sellerUploadProducts: sellerUploadCountResponse,
//   };
// }

export default async function sellerUploadCount(parent, args, context, info) {
  let { startDate, endDate, skip, limit, storeName, hashtagIds } = args;
  let { collections } = context;
  let { Products } = collections;

  let filterConditions = [];

  // Apply storeName or hashtagIds filters if provided, otherwise apply date filter
  if (storeName || (hashtagIds && hashtagIds.length > 0 && hashtagIds[0] !== "")) {
    if (storeName) {
      filterConditions.push({ "sellerDetails.storeName": storeName });
    }
    if (hashtagIds && hashtagIds.length > 0 && hashtagIds[0] !== "") {
      filterConditions.push({ "hashtags": { $in: hashtagIds } });
    }
  } else {
    filterConditions.push({
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    });
  }

  let sellerUploadCountPipeline = [
    {
      $lookup: {
        from: "Accounts",
        localField: "sellerId",
        foreignField: "_id",
        as: "sellerDetails",
      },
    },
    {
      $unwind: "$sellerDetails",
    },
    {
      $match: {
        $or: filterConditions
      }
    },
    {
      $project: {
        _id: 0,
        sellerId: 1,
        sellerLogo: "$sellerDetails.storeLogo",
        sellerEmail: "$sellerDetails.emails",
        sellerName: "$sellerDetails.storeName",
        sellerPhone: "$sellerDetails.profile",
        productCount: 1,
        productTitle: "$title",
        hashtags: "$hashtags",
      },
    },
    {
      $unwind: {
        path: "$sellerEmail",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $group: {
        _id: "$sellerId",
        sellerLogo: { $first: "$sellerLogo" },
        sellerEmail: { $first: "$sellerEmail.address" },
        sellerName: { $first: "$sellerName" },
        productCount: { $sum: 1 },
        sellerPhone: { $first: "$sellerPhone.phone" },
        productTitles: { $push: "$productTitle" },
        hashtags: { $push: "$hashtags" },
      },
    },
    {
      $project: {
        sellerId: "$_id",
        sellerLogo: 1,
        sellerEmail: 1,
        sellerName: 1,
        productCount: 1,
        sellerPhone: 1,
        productTitles: 1,
        hashtags: {
          $reduce: {
            input: "$hashtags",
            initialValue: [],
            in: { $concatArrays: ["$$value", "$$this"] },
          },
        },
      },
    },
    {
      $lookup: {
        from: "Tags",
        localField: "hashtags",
        foreignField: "_id",
        as: "hashtagDetails",
      },
    },
    {
      $project: {
        sellerId: 1,
        sellerLogo: 1,
        sellerEmail: 1,
        sellerName: 1,
        productCount: 1,
        sellerPhone: 1,
        productTitles: 1,
        hashtags: {
          $map: {
            input: "$hashtagDetails",
            as: "hashtag",
            in: {
              id: "$$hashtag._id",
              slug: "$$hashtag.slug"
            }
          }
        }
      },
    },
    { $skip: skip },
    { $limit: limit }
  ];

  let countPipeline = [
    ...sellerUploadCountPipeline.slice(0, -2),
    { $count: "totalcount" },
  ];

  let countResult = await Products.aggregate(countPipeline).toArray();
  let totalcount = countResult.length > 0 ? countResult[0].totalcount : 0;

  let sellerUploadCountResponse = await Products.aggregate(
    sellerUploadCountPipeline
  ).toArray();

  return {
    totalcount: totalcount,
    sellerUploadProducts: sellerUploadCountResponse,
  };
}
