import moment from 'moment';

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
  const isoStartDate = moment(startDate, "ddd, DD MMM YYYY HH:mm:ss [GMT]").toISOString();
  const isoEndDate = moment(endDate, "ddd, DD MMM YYYY HH:mm:ss [GMT]").toISOString();

  let { _id } = user;
  console.log("_id", _id);

  let query = {
    createdAt: { $gte: isoStartDate, $lte: isoEndDate },
    sellerId: _id,
    status: "paid",
  };
  console.log("query", query);

  let currentSellerEarnings = await Payments.find(query).toArray();
  console.log(
    "currentSellerEarnings",
    currentSellerEarnings.amount
  );

  return currentSellerEarnings.amount;
}
