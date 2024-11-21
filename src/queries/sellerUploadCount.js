// export default async function sellerUploadCount(parent, args, context, info) {
//   let { startDate, endDate, skip, limit, storeName } = args;
//   let { collections } = context;
//   let { Products } = collections;
//   let sellerUploadCountPipeline = [
//     {
//       $match: {
//         createdAt: {
//           $gte: startDate, // Start date
//           $lte: endDate, // End date
//         },
//       },
//     },
//     {
//       $lookup: {
//         from: "Accounts", // Replace with the actual name of the Accounts collection
//         localField: "sellerId",
//         foreignField: "_id",
//         as: "sellerDetails",
//       },
//     },
//     {
//       $unwind: "$sellerDetails", // Unwind the array created by $lookup
//     },
//     {
//       $project: {
//         _id: 0, // Exclude the _id field if needed
//         sellerId: 1,
//         sellerLogo: "$sellerDetails.storeLogo",
//         sellerEmail: "$sellerDetails.emails",
//         sellerName: "$sellerDetails.storeName",
//         sellerPhone: "$sellerDetails.profile",
//         productCount: 1,
//       },
//     },
//     {
//       $unwind: "$sellerEmail", // Unwind the array created by $lookup

//     },
//     {
//       $group: {
//         _id: "$sellerId",
//         sellerLogo: { $first: "$sellerLogo" },
//         sellerEmail: { $first: "$sellerEmail.address" },
//         sellerName: { $first: "$sellerName" },
//         productCount: { $sum: 1 },
//         sellerPhone: { $first: "$sellerPhone.phone" }

//       },
//     },
//     { $skip: skip }, // Skip the already fetched records
//     { $limit: limit }, // Fetch the next set of results
//   ];

//   if (storeName) {
//     console.log("Applying storeName filter:", storeName); // Log storeName
//     sellerUploadCountPipeline = [
//       {
//         $match: {
//           createdAt: {
//             $gte: startDate, // Start date
//             $lte: endDate, // End date
//           },
//         },
//       },
//       {
//         $lookup: {
//           from: "Accounts", // Replace with the actual name of the Accounts collection
//           localField: "sellerId",
//           foreignField: "_id",
//           as: "sellerDetails",
//         },
//       },
//       {
//         $unwind: "$sellerDetails", // Unwind the array created by $lookup
//       },
//       {
//         $match: {
//           "sellerDetails.storeName": storeName
//         }
//       },
//       {
//         $project: {
//           _id: 0, // Exclude the _id field if needed
//           sellerId: 1,
//           sellerLogo: "$sellerDetails.storeLogo",
//           sellerEmail: "$sellerDetails.emails",
//           sellerName: "$sellerDetails.storeName",
//           sellerPhone: "$sellerDetails.profile",
//           productCount: 1,
//         },
//       },
//       {
//         $unwind: "$sellerEmail", // Unwind the array created by $lookup

//       },
//       {
//         $group: {
//           _id: "$sellerId",
//           sellerLogo: { $first: "$sellerLogo" },
//           sellerEmail: { $first: "$sellerEmail.address" },
//           sellerName: { $first: "$sellerName" },
//           productCount: { $sum: 1 },
//           sellerPhone: { $first: "$sellerPhone.phone" }

//         },
//       },

//       { $skip: skip }, // Skip the already fetched records
//       { $limit: limit }, // Fetch the next set of results
//     ];
//   }
//   // let totalcount = await Products.countDocuments(sellerUploadCountPipeline)
//   // Remove $skip and $limit stages from the count pipeline
//   let countPipeline = [
//     ...sellerUploadCountPipeline.slice(0, -2), // Remove last two stages ($skip and $limit)
//     { $count: "totalcount" },
//   ];

//   let countResult = await Products.aggregate(countPipeline).toArray();
//   let totalcount = countResult.length > 0 ? countResult[0].totalcount : 0;

//   let sellerUploadCountResponse = await Products.aggregate(
//     sellerUploadCountPipeline
//   ).toArray();
//   console.log("sellerUploadCountResponse", sellerUploadCountResponse);
//   return {
//     totalcount: totalcount,
//     sellerUploadProducts: sellerUploadCountResponse,
//   };
// }



// SHOW THW TAGS NAME AGGREGATION

// export default async function sellerUploadCount(parent, args, context, info) {
//   let { startDate, endDate, skip, limit, storeName } = args;
//   let { collections } = context;
//   let { Products, Tags } = collections;

//   let sellerUploadCountPipeline = [
//     {
//       $match: {
//         createdAt: {
//           $gte: startDate,
//           $lte: endDate,
//         },
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
//         hashtags: "$hashtagDetails.slug",
//       },
//     },
//     { $skip: skip },
//     { $limit: limit },
//   ];

//   if (storeName) {
//     console.log("Applying storeName filter:", storeName);
//     sellerUploadCountPipeline = [
//       {
//         $match: {
//           createdAt: {
//             $gte: startDate,
//             $lte: endDate,
//           },
//         },
//       },
//       {
//         $lookup: {
//           from: "Accounts",
//           localField: "sellerId",
//           foreignField: "_id",
//           as: "sellerDetails",
//         },
//       },
//       {
//         $unwind: "$sellerDetails",
//       },
//       {
//         $match: {
//           "sellerDetails.storeName": storeName,
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           sellerId: 1,
//           sellerLogo: "$sellerDetails.storeLogo",
//           sellerEmail: "$sellerDetails.emails",
//           sellerName: "$sellerDetails.storeName",
//           sellerPhone: "$sellerDetails.profile",
//           productCount: 1,
//           productTitle: "$title",
//           hashtags: "$hashtags",
//         },
//       },
//       {
//         $unwind: "$sellerEmail",
//       },
//       {
//         $group: {
//           _id: "$sellerId",
//           sellerLogo: { $first: "$sellerLogo" },
//           sellerEmail: { $first: "$sellerEmail.address" },
//           sellerName: { $first: "$sellerName" },
//           productCount: { $sum: 1 },
//           sellerPhone: { $first: "$sellerPhone.phone" },
//           productTitles: { $push: "$productTitle" },
//           hashtags: { $push: "$hashtags" },
//         },
//       },
//       {
//         $project: {
//           sellerId: "$_id",
//           sellerLogo: 1,
//           sellerEmail: 1,
//           sellerName: 1,
//           productCount: 1,
//           sellerPhone: 1,
//           productTitles: 1,
//           hashtags: {
//             $reduce: {
//               input: "$hashtags",
//               initialValue: [],
//               in: { $concatArrays: ["$$value", "$$this"] },
//             },
//           },
//         },
//       },
//       {
//         $lookup: {
//           from: "Tags",
//           localField: "hashtags",
//           foreignField: "_id",
//           as: "hashtagDetails",
//         },
//       },
//       {
//         $project: {
//           sellerId: 1,
//           sellerLogo: 1,
//           sellerEmail: 1,
//           sellerName: 1,
//           productCount: 1,
//           sellerPhone: 1,
//           productTitles: 1,
//           hashtags: "$hashtagDetails.slug",
//         },
//       },
//       { $skip: skip },
//       { $limit: limit },
//     ];
//   }

//   let countPipeline = [
//     ...sellerUploadCountPipeline.slice(0, -2),
//     { $count: "totalcount" },
//   ];

//   let countResult = await Products.aggregate(countPipeline).toArray();
//   let totalcount = countResult.length > 0 ? countResult[0].totalcount : 0;

//   let sellerUploadCountResponse = await Products.aggregate(
//     sellerUploadCountPipeline
//   ).toArray();
//   console.log("sellerUploadCountResponse", sellerUploadCountResponse);

//   return {
//     totalcount: totalcount,
//     sellerUploadProducts: sellerUploadCountResponse,
//   };
// }





// FILTER ON TAGS SLUG AND THE STORENAME

// export default async function sellerUploadCount(parent, args, context, info) {
//   let { startDate, endDate, skip, limit, storeName, tagSlugs } = args;
//   let { collections } = context;
//   let { Products, Tags } = collections;

//   let sellerUploadCountPipeline = [
//     {
//       $match: {
//         createdAt: {
//           $gte: startDate,
//           $lte: endDate,
//         },
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
//     // Apply storeName filter if provided
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
//         hashtags: "$hashtagDetails.slug",
//       },
//     }
//   ];

//   // Apply tagSlugs filter if provided
//   if (tagSlugs && tagSlugs.length > 0) {
//     sellerUploadCountPipeline.push(
//       {
//         $match: {
//           "hashtags": { $in: tagSlugs }
//         },
//       }
//     );
//   }

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

  let sellerUploadCountPipeline = [
    // Initial match on date range and provided hashtagIds, if any
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
        ...(hashtagIds && hashtagIds.length > 0 ? { hashtags: { $in: hashtagIds } } : {})
      },
    },
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
    ...(storeName ? [
      {
        $match: {
          "sellerDetails.storeName": storeName,
        },
      }
    ] : []),
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
      $unwind: "$sellerEmail",
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
    }
  ];

  // Add skip and limit stages
  sellerUploadCountPipeline.push({ $skip: skip }, { $limit: limit });

  // Count pipeline (excluding $skip and $limit)
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
