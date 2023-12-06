
import ReactionError from "@reactioncommerce/reaction-error";

export default async function sellerRegistraionMonthly(parent, args, context, info) {
    // console.log("sellerUploadCount query", args);
  console.log("sellerRegistraionMonthly test 2")
  const sellerRegistraionMonthly = await context.queries.sellerRegistraionMonthly(parent, args, context, info);
  return sellerRegistraionMonthly;
}
