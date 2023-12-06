import ReactionError from "@reactioncommerce/reaction-error";
export default async function soldProductsMonthly(parent, args, context, info) {
    let { account } = context;
    if (account === null || account === undefined) {
        throw new ReactionError("access-denied", "Access Denied");
    }
    if (account?.adminUIShopIds === null || account?.adminUIShopIds === undefined) {
        throw new ReactionError("access-denied", "Access Denied");
    }
    const soldProductsMonthlyResp = await context.queries.soldProductsMonthly(parent, args, context, info);
    return soldProductsMonthlyResp;


}

