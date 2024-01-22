export default async function currentSellerUploadedProductMonthly(
  parent,
  args,
  context,
  info
) {
  let { startDate, endDate, skip, limit } = args;

  let { user, collections } = context;
  let { Products } = collections;

  let { _id } = user;
  console.log("_id", _id);
  let query = {
    createdAt: { $gte: startDate, $lte: endDate },
    "uploadedBy.userId": _id,
  };

  let currentSellerActiveProductsCount = await Products.find(query).toArray();
  console.log(
    "currentSellerActiveProductsCount",
    currentSellerActiveProductsCount.length
  );

  return {
    totalUploadedItems : currentSellerActiveProductsCount.length,
  };
}
