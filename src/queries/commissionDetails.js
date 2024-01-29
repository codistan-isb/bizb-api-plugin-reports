import moment from "moment";

export default async function commissionDetails(parent, args, context, info) {
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
  // If you want details on commission for each sale, you can map the results
  const commissionDetails = currentSellerEarnings.map((doc) => {
    return {
      orderId: doc.orderId,
      commissionFee: doc.fee,
      netProfit: doc.amount,
    };
  });

  console.log("Commission Details", commissionDetails);

  return commissionDetails;
}
