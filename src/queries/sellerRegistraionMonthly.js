
export default async function sellerRegistraionMonthly(parent, args, context, info) {
    let { startDate, endDate, skip, limit, storeName, email, contact } = args;
    let { collections } = context
    let { Accounts } = collections;
    let match = {};

    // let uploadedProductsMonthly = await Products.find({}).toArray();

    // console.log("uploadedProductsMonthly",startDate, endDate, skip, limit)
    if (storeName) {
        match['storeName'] = storeName;
    }
    if (email) {
        match['emails.address'] = email;
    }
    if (contact) {
        match['contactNumber'] = contact;
    }

    let query = {
        "createdAt": {"$gte": startDate, "$lte": endDate}
    }
    query = { ...query, ...match };

    let total_count = await Accounts.count(query)

    let sellerRegistraionMonthly = await Accounts.find(query).skip(skip).limit(limit).toArray();

    // cursor = collection.find(query).skip(skip).limit(limit)

    // result = list(cursor)

    return {
        totalcount: total_count ,
        seller : sellerRegistraionMonthly
    };
   
    
}
