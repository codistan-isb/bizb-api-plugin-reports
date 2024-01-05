export default async function product(parent, args, context, info) {
    let { collections } = context
    let { Products } = collections;
    const {productId} = parent

    const product =  await Products.findOne({_id: productId})
    return product
}

