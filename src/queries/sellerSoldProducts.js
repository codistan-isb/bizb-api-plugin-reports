export default async function sellerSoldProducts(args, context) {
    let { collections } = context;
    let { Catalog } = collections;
    let { userId } = args; // Assuming userId is part of the args parameter

    let query = {
        "product.variants.uploadedBy.userId": userId,
        "product.isSoldOut": true, // Change to false for active products
    };

    let sellerSoldProductsResp = await Catalog.countDocuments(query);

    console.log("Active Products Count for User ID", userId, ":", sellerSoldProductsResp);
    return {
        totalSoldProductCount: sellerSoldProductsResp}

}
