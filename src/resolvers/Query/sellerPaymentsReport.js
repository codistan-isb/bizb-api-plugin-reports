import ReactionError from "@reactioncommerce/reaction-error";

export default async function sellerPaymentsReport(parent, args, context, info) {
    let { account } = context;
    // if (account === null || account === undefined) {
    //     throw new ReactionError("access-denied", "Access Denied");
    // }
    // if (account?.adminUIShopIds === null || account?.adminUIShopIds === undefined) {
    //     throw new ReactionError("access-denied", "Access Denied");
    // }
    const sellerPaymentsReportResp = await context.queries.sellerPaymentsReport(parent, args, context, info);
    return sellerPaymentsReportResp;
}

