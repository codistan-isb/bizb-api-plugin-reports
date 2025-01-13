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

    if (promoCode) {
        console.log("PROMO CODE: " + promoCode);
        // Find the seller with the given promo code
        const sellerWithPromo = await SellerDiscounts.findOne({ code: promoCode });

        // Check if a seller was found
        if (sellerWithPromo) {

            // If you need to use the seller ID later on:
            const sellerId = sellerWithPromo.sellerId;

            if (sellerId) {
                query['_id'] = sellerId;
            }
        } else {
            // If no seller found, return early with empty results
            return {
                totalcount: 0,
                seller: []
            };
        }
    }

    console.log("Final query: ", query);
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
