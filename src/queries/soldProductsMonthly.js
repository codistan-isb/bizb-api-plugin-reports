
export default async function soldProductsMonthly(parent, args, context, info) {
    let { startDate, endDate, skip, limit, } = args;
    let { collections } = context
    let { SimpleInventory } = collections;

    let match = {};
    // match["inventoryInStock"]
    match['inventoryInStock'] = 0;
    if (startDate && endDate) {
        match.updatedAt = {
            $gte: startDate,
            $lte: endDate
        };

    }
    let total_count = await SimpleInventory.count(match);
    // console.log("total_count", total_count);
    let soldProductsMonthly = await SimpleInventory.find(match).skip(skip).limit(limit).toArray();
    // console.log("soldProductsMonthly", soldProductsMonthly);

    return {
        totalcount: total_count,
        soldProducts: soldProductsMonthly
    };


}

