
export default async function sellerPaymentsReport(parent, args, context, info) {
    console.log("sellerOrderCount query args", args);
    let { startDate, endDate, skip, limit, paymentStatus, productId } = args;
    let { collections } = context
    let { Payments } = collections;
    let match = {};
    if (startDate && endDate) {
        match.createdAt = {
            $gte: startDate,
            $lte: endDate
        };
    }
    if (paymentStatus) {
        match['status'] = paymentStatus;
    }
    if (productId) {
        match['productId'] = productId;
    }
    console.log("match", match);
    let total_count = await Payments.countDocuments(match);
    console.log("total_count", total_count);
    let paymentRecord = await Payments.find(match).skip(skip).limit(limit).toArray();
    console.log("paymentRecord", paymentRecord);
    return {
        totalcount: total_count,
        PaymentRecord: paymentRecord
    }
}

