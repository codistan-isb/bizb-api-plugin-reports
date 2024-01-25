import moment from "moment";

export default async function currentSellerSales(parent, args, context, info) {
  let { startDate, endDate } = args;
  let { user, collections } = context;
  let { Payments } = collections;

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
  const totalAmount = currentSellerEarnings.reduce(
    (sum, doc) => sum + doc.amount,
    0
  );
  console.log("currentSellerEarnings", totalAmount);
  return totalAmount;
}
