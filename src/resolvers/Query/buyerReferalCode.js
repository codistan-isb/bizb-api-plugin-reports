import getPaginatedResponse from "@reactioncommerce/api-utils/graphql/getPaginatedResponse.js";
import wasFieldRequested from "@reactioncommerce/api-utils/graphql/wasFieldRequested.js";

export default async function buyerReferalCode(parent, args, context, info) {
  let { account } = context;
  if (account === null || account === undefined) {
    throw new ReactionError("access-denied", "Access Denied");
  }
  if (account?.roles != "vendor") {
    throw new ReactionError("access-denied", "Access Denied");
  }

  const buyer = await context.queries.buyerReferalCode(
    parent,
    args,
    context,
    info
  );
 

return buyer;
}
