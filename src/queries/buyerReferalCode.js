export default async function buyerReferalCode(parent, args, context, info) {
  const { collections } = context;
  const { Orders, Accounts } = collections;
  try {
    const ordersWithDiscounts = await Orders.find({
      discounts: { $exists: true, $ne: [] },
    }).toArray();

    const buyerReferralUsages = [];

    for (const order of ordersWithDiscounts) {
      for (const discount of order.discounts) {
        const account = await Accounts.findOne({ _id: order.accountId });

        const buyerReferralUsage = {
          discountCode: discount.code,
          Account: account,
        };

        buyerReferralUsages.push(buyerReferralUsage);
      }
    }
    return buyerReferralUsages;
  } catch (error) {
    // Handle errors
    console.error("Error fetching buyer referral codes:", error);
    throw error; // You may want to handle this more gracefully
  }
}
