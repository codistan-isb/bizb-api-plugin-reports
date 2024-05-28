export default async function soldProduct(parent, args, context, info) {
    console.log("parent in soldProduct", parent);
    let {  collections } = context;
  let { SimpleInventory,  Products ,Accounts} = collections;
  try {
    if (parent ) {
        var id = parent?._id;
        console.log("userId", id);
        // Rest of your code
      } else {
        throw new Error("Parent object or _id property is undefined");
      }
    console.log("userId", id);
    const account = await Accounts.findOne({_id:id})
      console.log("account",account)
    // Step 1: Fetch all products for the given seller ID
    const allProducts = await Products.find({ sellerId: account?.userId }).toArray();
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
    const soldProduct ={
        totalSoldProductCount : soldProductCount
    }
    return soldProduct;
}
catch (error) {
    console.log("error", error);
    throw new Error(error);
}

}