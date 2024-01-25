import ReactionError from "@reactioncommerce/reaction-error";
export default async function sellerListedProduct(parent, args, context, info) {
  let { user, collections } = context;
  let { SimpleInventory, Catalog, Products } = collections;
  try {
    let { _id } = user;
    console.log("user", user);
    // Step 1: Fetch all products for the given seller ID
    const allProducts = await Products.find({ sellerId: _id }).toArray();
    // console.log("allProducts", allProducts);

    // Step 2: Fetch sold products with inventoryInStock: 0 for the specific seller's products
    const productIds = allProducts.map((product) => product._id);
    // console.log("allProductsIds", productIds);

    const soldProducts = await SimpleInventory.find({
      inventoryInStock: 0,
      "productConfiguration.productId": { $in: productIds },
    }).toArray();
  

    // Step 3: Count the number of sold products
    const soldProductCount = soldProducts.length;
    console.log("soldProductCount", soldProductCount);

    // Step 4: Fetch all Publish products for the given seller ID
    const allPublishedProducts = await Catalog.find({
      "product.variants.uploadedBy.userId": _id,
      "product.isVisible": true,
    }).toArray();
    console.log("allPublishedProducts", allPublishedProducts.length);

    // Step 5: Count the number of unpublished products
    const unpublishedProductCount = await Catalog.find({
      "product.variants.uploadedBy.userId": _id,
      "product.isVisible": false,
    }).toArray();

    // Step 6: Count listed products
    const listedProductCount =
      soldProducts.length +
      unpublishedProductCount.length +
      allPublishedProducts.length;
    console.log("listedProductCount", listedProductCount);

    const sellerListedProduct = {
      soldProduct:  soldProductCount,
      publishedProducts: allPublishedProducts.length,
      unPublishedProducts: unpublishedProductCount.length,
      ListedProduct: listedProductCount,
    };
    return sellerListedProduct;
  } catch (error) {
    console.log("error", error);
    throw new Error(error);
  }
}
