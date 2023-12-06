
export default async function uploadedProductsMonthly(parent, args, context, info) {
    let { startDate, endDate, skip, limit, } = args;
    let { collections } = context
    let { Products } = collections;

    // let uploadedProductsMonthly = await Products.find({}).toArray();

    // console.log("uploadedProductsMonthly",startDate, endDate, skip, limit)

    let query = {
        "createdAt": {"$gte": startDate, "$lte": endDate}
    }

    let total_count = await Products.count(query)

    let uploadedProductsMonthly = await Products.find(query).skip(skip).limit(limit).toArray();

    // cursor = collection.find(query).skip(skip).limit(limit)

    // result = list(cursor)

    return {
        totalcount: total_count ,
        product : uploadedProductsMonthly
    };
   
    
}

