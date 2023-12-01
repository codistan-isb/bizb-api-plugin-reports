
import ReactionError from "@reactioncommerce/reaction-error";

export default async function sellerUploadCount(parent, args, context, info) {
    // console.log("sellerUploadCount query", args);
    let { account } = context;
    if (account === null || account === undefined) {
        throw new ReactionError("access-denied", "Access Denied");
    }
    if (account?.adminUIShopIds === null || account?.adminUIShopIds === undefined) {
        throw new ReactionError("access-denied", "Access Denied");
    }
    const sellerUploadCountResp = await context.queries.sellerUploadCount(parent, args, context, info);
    return sellerUploadCountResp;
}

