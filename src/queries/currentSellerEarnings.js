import moment from "moment";

export default async function currentSellerEarnings(
  parent,
  args,
  context,
  info
) {
  let { startDate, endDate } = args;
  let { user, collections } = context;
  let { Payments } = collections;

  // Convert startDate and endDate to ISO 8601 format

  let { _id } = user;
  console.log("_id", _id);
  const formattedStartDate = moment(startDate)
    .utc()
    .format("ddd, DD MMM YYYY HH:mm:ss [GMT]");
  const formattedEndDate = moment(endDate)
    .utc()
    .format("ddd, DD MMM YYYY HH:mm:ss [GMT]");

  console.log("Formatted Start Date", formattedStartDate);
  console.log("Formatted End Date", formattedEndDate);

  let query = {
    createdAt: { $gte: formattedStartDate, $lte: formattedEndDate },
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

  const earning = {
    totalEarnings: totalAmount,
  };

  return earning;
}
