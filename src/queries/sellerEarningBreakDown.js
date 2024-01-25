export default async function sellerEarningBreakDown(
  parent,
  args,
  context,
  info
) {
 
  let { user, collections } = context;
  let { Payments } = collections;

  // Convert startDate and endDate to ISO 8601 format
  let { _id } = user;
  console.log("_id", _id);

  let query = {
    sellerId: _id,
    status: "paid",
  };
  console.log("query", query);

  let currentSellerEarnings = await Payments.find(query).toArray();

  // Assuming currentSellerEarnings is an array of documents
  // If you want the sum of the 'amount' field from each document, you can use reduce
  const totalRevenue = currentSellerEarnings.reduce(
    (sum, doc) => sum + doc.totalPrice,
    0
  );

  const totalCommission = currentSellerEarnings.reduce(
    (sum, doc) => sum + doc.fee,
    0
  );

  const netProfit = currentSellerEarnings.reduce(
    (sum, doc) => sum + doc.amount,
    0
  );

  console.log("Total Revenue", totalRevenue);
  console.log("Total Commission", totalCommission);
  console.log("Net Profit after Commission", netProfit);

  const earning = {
    totalRevenue,
    totalCommission,
    netProfit,
  };

  return earning;
}
