
import ReactionError from "@reactioncommerce/reaction-error";

export default async function uploadedProductsMonthly(parent, args, context, info) {
    // console.log("sellerUploadCount query", args);
  console.log("uploadedProductsMonthly test 2")
  const uploadedProductsMonthly = await context.queries.uploadedProductsMonthly(parent, args, context, info);
  return uploadedProductsMonthly;
}
