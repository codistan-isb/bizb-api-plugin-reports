import ReactionError from "@reactioncommerce/reaction-error";

export default async function currentSellerUploadedProductMonthly(parent, args, context, info) {
    let { account } = context;
    if (account === null || account === undefined) {
        throw new ReactionError("access-denied", "Access Denied");
    }
    if (account?.roles != 'vendor') {
        throw new ReactionError("access-denied", "Access Denied");
    }
    const currentSellerUploadedProductMonthly = await context.queries.currentSellerUploadedProductMonthly(parent, args, context, info);
    return currentSellerUploadedProductMonthly;
}

