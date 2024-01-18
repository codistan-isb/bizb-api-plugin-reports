import ReactionError from "@reactioncommerce/reaction-error";

export default async function sellerSoldProducts(parent, args, context, info) {
    const sellerSoldProductsResp = await context.queries.sellerSoldProducts(args, context);
    return sellerSoldProductsResp;
}

