import pkg from 'mongodb'; // or ObjectID 
const { ObjectId } = pkg;

export default async function sellerRegistrationMonthly(parent, args, context, info) {
    let { startDate, endDate, skip, limit, storeName, email, contact, promoCode } = args;
    let { collections } = context;
    let { Accounts, SellerDiscounts } = collections;
    let match = {};

    if (storeName) {
        match['storeName'] = storeName;
    }
    if (email) {
        match['emails.address'] = email;
    }
    if (contact) {
        match['contactNumber'] = contact;
    }

    let query  = {
        "createdAt": { "$gte": new Date(startDate), "$lte": new Date(endDate) }
    };
    query = { ...query , ...match };
    console.log("Initial query: ", query);

    if (promoCode) {
        console.log("Promo code: ", promoCode);
        const promoCodeFilter = { code: promoCode };
        console.log("PromoCodeFilter: ", promoCodeFilter);

        const sellersWithPromo = await SellerDiscounts.find(promoCodeFilter).toArray();
        console.log("Sellers with promo code: ", sellersWithPromo);

        const sellerIds = sellersWithPromo.map(seller => seller.sellerId);
        console.log("Seller IDs: ", sellerIds);
        console.log("Seller IDs type: ", typeof(sellerIds));


        if (sellerIds.length > 0) {
            query['_id'] = sellerIds.length === 1 ? sellerIds[0] : { $in: sellerIds };
        } else {
            // If no sellers found with the given promo code, return empty results early
            return {
                totalcount: 0,
                seller: []
            };
        }
    }
    console.log("Final query: ", query);

    let total_count = await Accounts.countDocuments(query);
    console.log("Total count: ", total_count);

    let sellerRegistrationMonthly = await Accounts.find(query).skip(skip).limit(limit).toArray();
    console.log("Seller registration monthly: ", sellerRegistrationMonthly);

    return {
        totalcount: total_count,
        seller: sellerRegistrationMonthly
    };
}
