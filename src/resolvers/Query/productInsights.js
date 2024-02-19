import ReactionError from "@reactioncommerce/reaction-error";

export default async function productInsights(parent, args, context, info) {
    let { account } = context;
    if (account === null || account === undefined) {
        throw new ReactionError("access-denied", "Access Denied");
    }
    if (account?.roles != 'vendor') {
        throw new ReactionError("access-denied", "Access Denied");
    }
    const productInsights = await context.queries.productInsights(parent, args, context, info);
    console.log("productInsights", productInsights);
    return productInsights;
}

