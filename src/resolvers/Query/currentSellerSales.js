import ReactionError from "@reactioncommerce/reaction-error";

export default async function currentSellerSales(parent, args, context, info) {
    let { account } = context;
    if (account === null || account === undefined) {
        throw new ReactionError("access-denied", "Access Denied");
    }
    if (account?.roles != 'vendor') {
        throw new ReactionError("access-denied", "Access Denied");
    }
    const currentSellerSale = await context.queries.currentSellerSales(parent, args, context, info);
    console.log("currentSellerUploadedProductMonthly", currentSellerSale);
    return currentSellerSale;
}

