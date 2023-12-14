
export default async function soldProductsMonthly(parent, args, context, info) {
    let { startDate, endDate, sold, skip, limit, } = args;
    let { collections } = context
    let { Products } = collections;

    // let uploadedProductsMonthly = await Products.find({}).toArray();

    // console.log("uploadedProductsMonthly",startDate, endDate, skip, limit)

    let query = {
        "createdAt": {"$gte": startDate, "$lte": endDate},
        "sold": sold  
    }

    let total_count = await Products.count(query)

    let soldProductsMonthly = await Products.find(query).skip(skip).limit(limit).toArray();

    // cursor = collection.find(query).skip(skip).limit(limit)

    // result = list(cursor)

    return {
        totalcount: total_count ,
        product : soldProductsMonthly
    };
   
    
}

