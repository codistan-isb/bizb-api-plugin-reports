
export default async function sellerRegistraionMonthly(parent, args, context, info) {
    let { startDate, endDate, skip, limit, } = args;
    let { collections } = context
    let { Accounts } = collections;

    // let uploadedProductsMonthly = await Products.find({}).toArray();

    // console.log("uploadedProductsMonthly",startDate, endDate, skip, limit)

    let query = {
        "createdAt": {"$gte": startDate, "$lte": endDate}
    }

    let total_count = await Accounts.count(query)

    let sellerRegistraionMonthly = await Accounts.find(query).skip(skip).limit(limit).toArray();

    // cursor = collection.find(query).skip(skip).limit(limit)

    // result = list(cursor)

    return {
        totalcount: total_count ,
        seller : sellerRegistraionMonthly
    };
   
    
}
