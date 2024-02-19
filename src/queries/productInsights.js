import ReactionError from "@reactioncommerce/reaction-error";

export default async function productInsights(parent, args, context, info) {
  try {
    const { user, collections } = context;
    const { Catalog } = collections;
    const { _id } = user;
console.log("user",_id);
    const productInsights = await Catalog.find({
      "product.variants.uploadedBy.userId": _id,
      "product.isVisible": true,
      "product.isDeleted": false,
    }).toArray();
    const insights = productInsights.map(product => ({
      productId: product.product._id, // Assuming _id is the productId
      viewCount: product.product.viewCount // Assuming viewCount is a field in the product document
    }));

   
    // console.log("productInsightsResponse", productInsightsResponse);
    return insights;
  } catch (error) {
    console.error("Error fetching product insights:", error);
    throw new ReactionError({
      message: "Error fetching product insights",
      statusCode: 500
    });
  }
}
