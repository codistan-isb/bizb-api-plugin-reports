import ReactionError from "@reactioncommerce/reaction-error";
export default async function sellerListedProduct(parent, args, context, info) {

    let { account } = context;
    if (account === null || account === undefined) {
        throw new ReactionError("access-denied", "Access Denied");
    }
    if (account?.roles != 'vendor') {
        throw new ReactionError("access-denied", "Access Denied");
    }
    const listProduct = await context.queries.sellerListedProduct(parent, args, context, info);
    return listProduct;
}