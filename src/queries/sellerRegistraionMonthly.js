// import pkg from 'mongodb'; // or ObjectID 
// const { ObjectId } = pkg;

// export default async function sellerRegistrationMonthly(parent, args, context, info) {
//     let { startDate, endDate, skip, limit, storeName, email, contact, promoCode } = args;
//     let { collections } = context;
//     let { Accounts, SellerDiscounts } = collections;
//     let match = {};

//     if (storeName) {
//         match['storeName'] = storeName;
//     }
//     if (email) {
//         match['emails.address'] = email;
//     }
//     if (contact) {
//         match['contactNumber'] = contact;
//     }

//     let query = {
//         "createdAt": { "$gte": new Date(startDate), "$lte": new Date(endDate) }
//     };
//     query = { ...query, ...match };
//     console.log("Initial query: ", query);

//     if (promoCode) {
//         console.log("Promo code: ", promoCode);
//         const promoCodeFilter = { code: promoCode };
//         console.log("PromoCodeFilter: ", promoCodeFilter);

//         const sellersWithPromo = await SellerDiscounts.find(promoCodeFilter).toArray();
//         console.log("Sellers with promo code: ", sellersWithPromo);

//         const sellerIds = sellersWithPromo.map(seller => seller.sellerId);
//         console.log("Seller IDs: ", sellerIds);
//         console.log("Seller IDs type: ", typeof (sellerIds));


//         if (sellerIds.length > 0) {
//             query['_id'] = sellerIds.length === 1 ? sellerIds[0] : { $in: sellerIds };
//         } else {
//             // If no sellers found with the given promo code, return empty results early
//             return {
//                 totalcount: 0,
//                 seller: []
//             };
//         }
//     }
//     console.log("Final query: ", query);

//     let total_count = await Accounts.countDocuments(query);
//     console.log("Total count: ", total_count);

//     let sellerRegistrationMonthly = await Accounts.find(query).skip(skip).limit(limit).toArray();
//     console.log("Seller registration monthly: ", sellerRegistrationMonthly);

//     return {
//         totalcount: total_count,
//         seller: sellerRegistrationMonthly
//     };
// }



import pkg from 'mongodb';
const { ObjectId } = pkg;

export default async function sellerRegistrationMonthly(parent, args, context, info) {
    const { startDate, endDate, skip, limit, storeName, email, contact, promoCode } = args;
    const { collections } = context;
    const { Accounts, SellerDiscounts } = collections;

    // Initialize the query object
    let query = {};

    // Check if user provided email, storeName, or contact
    const prioritizeFields = !!(email || storeName || contact);

    // Apply filters based on provided arguments
    if (storeName) {
        query['storeName'] = storeName;
    }
    if (email) {
        query['emails.address'] = email;
    }
    if (contact) {
        query['contactNumber'] = contact;
    }

    // Apply date range filter only if none of the prioritizeFields are provided
    if (!prioritizeFields && (startDate || endDate)) {
        query['createdAt'] = {};
        if (startDate) {
            query['createdAt']['$gte'] = new Date(startDate);
        }
        if (endDate) {
            query['createdAt']['$lte'] = new Date(endDate);
        }
    }

    // Handle promoCode filter
    if (promoCode) {
        const promoCodeFilter = { code: promoCode };

        // Find sellers with the given promo code
        const sellersWithPromo = await SellerDiscounts.find(promoCodeFilter).toArray();

        // Extract seller IDs from the promo code results
        const sellerIds = sellersWithPromo.map(seller => seller.sellerId);

        // Update query with seller IDs if promo code matches are found
        if (sellerIds.length > 0) {
            query['_id'] = sellerIds.length === 1 ? ObjectId(sellerIds[0]) : { $in: sellerIds.map(id => ObjectId(id)) };
        } else {
            // If no sellers found with the given promo code, return empty results early
            return {
                totalcount: 0,
                seller: []
            };
        }
    }

    // Get the total count of documents matching the query
    const total_count = await Accounts.countDocuments(query);

    // Fetch the sellers with pagination
    const sellerRegistrationMonthly = await Accounts.find(query).skip(skip).limit(limit).toArray();

    // Map through the sellers to fetch the referral code for each seller
    const sellerWithReferralCode = await Promise.all(
        sellerRegistrationMonthly.map(async (seller) => {
            // Find the referral code in SellerDiscounts
            const referral = await SellerDiscounts.findOne({ sellerId: seller._id.toString() });
            // Add the referral code to the seller object
            return {
                ...seller,
                referralCode: referral ? referral.code : null,
            };
        })
    );

    // Return the results
    return {
        totalcount: total_count,
        seller: sellerWithReferralCode
    };
}
