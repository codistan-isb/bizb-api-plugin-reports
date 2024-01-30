import moment from "moment";

export default async function currentSellerEarnings(
  parent,
  args,
  context,
  info
) {
  try {
    let { startDate, endDate } = args;
    let { user, collections } = context;
    let { Payments } = collections;

    // Convert startDate and endDate to ISO 8601 format
    let { _id } = user;
    console.log("_id", _id);

    const formattedStartDate = moment(startDate)
      .utc()
      .format("ddd, DD MMM YYYY HH:mm:ss [GMT]");
    const formattedEndDate = moment(endDate)
      .utc()
      .format("ddd, DD MMM YYYY HH:mm:ss [GMT]");

    console.log("Formatted Start Date", formattedStartDate);
    console.log("Formatted End Date", formattedEndDate);

    let query = {
      createdAt: {
        $gte: formattedStartDate,
        $lte: formattedEndDate,
      },
      sellerId: _id,
      status: "paid",
    };
    console.log("query", query);

    let currentSellerEarnings = await Payments.find(query).toArray();
    console.log("currentSellerEarnings", currentSellerEarnings);

    // Group payments by week
    // Group payments by week
    const earningsByWeek = currentSellerEarnings.reduce((acc, doc) => {
      const weekStartDate = moment(doc.createdAt)
        .startOf("week")
        .utc()
        .format("YYYY-MM-DDTHH:mm:ss[Z]");

      if (!acc[weekStartDate]) {
        acc[weekStartDate] = 0;
      }
      acc[weekStartDate] += doc.amount;
      return acc;
    }, {});
    console.log("Earnings By Week", earningsByWeek);

    // Calculate the week numbers dynamically based on the start and end dates
    const firstWeekStart = moment(formattedStartDate).startOf("week");
    const lastWeekEnd = moment(formattedEndDate).endOf("week");
    const weekData = [];

    let currentWeekStart = firstWeekStart;
    let weekNumber = 1;
    while (currentWeekStart.isBefore(lastWeekEnd)) {
      const weekStartDate = currentWeekStart.utc().format("YYYY-MM-DDTHH:mm:ss[Z]");
      const weekEndDate = moment(currentWeekStart).endOf("week").utc().format("YYYY-MM-DDTHH:mm:ss[Z]");
      const totalEarnings = earningsByWeek[weekStartDate] || 0;

      weekData.push({
        name: `Week ${weekNumber}, ${currentWeekStart.format("D MMM")}-${moment(currentWeekStart).endOf("week").format("D MMM")}`,
        uv: totalEarnings,
        pv: totalEarnings,
        amt: totalEarnings,
      });

      currentWeekStart.add(1, "week");
      weekNumber += 1;
    }

    console.log("Week Data", weekData);

    return { weekData };
  } catch (error) {
    console.log(error);
    throw new Error("Error fetching current seller earnings");
  }
}
