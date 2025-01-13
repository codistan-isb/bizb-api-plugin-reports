export default async function sellerPromoCode(node, args, context) {
    const { collections } = context;
    const { Accounts, SellerDiscounts } = collections;

    // console.log("NODE ", node._id);

    const sellerPromoCode = await SellerDiscounts.findOne({ sellerId: node._id });

    // Check if a promo code was found before trying to access its properties
    if (!sellerPromoCode) {
        // console.log("No promo code found for seller ID:", node._id);
        return null; // Or return an appropriate default object if necessary
    }

    // console.log("PROMO CODE ", sellerPromoCode);
    return {
        code: sellerPromoCode.code,
        type: sellerPromoCode.type,
        description: sellerPromoCode.description
    };
}
