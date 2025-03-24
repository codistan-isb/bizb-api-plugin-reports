export default async function sellerSoldProducts(args, context) {
    let { collections } = context;
    let { Catalog, Accounts, Tags } = collections;
    let { userId, storeNameSearch } = args; // Assuming userId is part of the args parameter

    // Fetch sellerIds based on storeNameSearch
    if (storeNameSearch) {
        const storeName = await Accounts.find({
            storeName: storeNameSearch
        }).toArray();

        // console.log("tags here in catalog", storeName);
        userId = storeName.map(store => store._id);
    }

    console.log("User ID", userId);

    let query = {
        "product.variants.uploadedBy.userId": { $in: userId },
        "product.isSoldOut": true, // Change to false for active products
    };

    let sellerSoldProductsResp = await Catalog.countDocuments(query);

    console.log("Active Products Count for User ID", userId, ":", sellerSoldProductsResp);
    return {
        totalSoldProductCount: sellerSoldProductsResp
    }

}
