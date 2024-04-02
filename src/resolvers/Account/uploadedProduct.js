export default async function soldProduct(parent, args, context, info) {

    console.log("parent in uploadProduct", parent);
    let {  collections } = context;
    let { SimpleInventory, Catalog, Products, Accounts} = collections;
    try {
        if (parent) {
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

      const allPublishedProducts = await Catalog.find({
        "product.variants.uploadedBy.userId": id,
        "product.isVisible": true,
        "product.isDeleted": false,
        "product.isSoldOut": false,
      }).toArray();
      console.log("allPublishedProducts", allPublishedProducts.length);
      const uploadProduct  = {
        totalUploadedProductCount : allPublishedProducts.length
      }
      return  uploadProduct;
    }
    catch (error) {
        console.log("error", error);
        throw new Error(error);
    }


}