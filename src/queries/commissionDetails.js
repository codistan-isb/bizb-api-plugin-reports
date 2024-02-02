import moment from "moment";

export default async function commissionDetails(parent, args, context, info) {
  let { user, collections } = context;
  let { Payments } = collections;

  let { _id } = user;
  let query = {
    sellerId: _id,
    status: "paid",
  };

  let currentSellerEarnings = await Payments.find(query).toArray();
  let totalCount = await Payments.countDocuments(query);

  const commissionDetails = currentSellerEarnings.map((doc) => {
    return {
      orderId: doc.orderId,
      commissionFee: doc.fee,
      netProfit: doc.amount,
    };
  });

  const commissionDetailsResponse = {
    totalCount,
    commissionDetails,
  };

  console.log("Commission Details", commissionDetailsResponse);

  return commissionDetailsResponse;
}
