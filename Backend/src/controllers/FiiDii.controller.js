import FiiDiiData from "../models/FiiDiiData.model.js";

const getFiiDiiData = async (req, res) => {
  try {
    const currentDate = new Date();
    const currentMonth = String(currentDate.getMonth() + 1).padStart(2, "0");
    const currentYear = String(currentDate.getFullYear());

    const data = await FiiDiiData.find({}, { _id: 0, __v: 0 }).lean();

    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: "No data found" });
    }

    // Common date parse helper
    const parseItem = (item) => ({
      date: item.date,
      fii_buy: parseFloat(item.fii_buy.replace(/,/g, "")),
      fii_sell: parseFloat(item.fii_sell.replace(/,/g, "")),
      fii_net: parseFloat(item.fii_net.replace(/,/g, "")),
      dii_buy: parseFloat(item.dii_buy.replace(/,/g, "")),
      dii_sell: parseFloat(item.dii_sell.replace(/,/g, "")),
      dii_net: parseFloat(item.dii_net.replace(/,/g, "")),
      in_market: parseFloat(item.in_market?.replace(/,/g, "") || "0"),
    });

    const formatDate = (d) => {
      const [dd, mm, yyyy] = d.split("-");
      return new Date(`${yyyy}-${mm}-${dd}`);
    };

    // Filter current month data
    let resdata = data
      .filter((item) => {
        const [day, month, year] = item.date.split("-");
        return month === currentMonth && year === currentYear;
      })
      .map(parseItem);

    // If current month data empty → fallback to latest month available
    if (resdata.length === 0) {
      // Find latest month and year from data
      const sortedData = [...data].sort((a, b) => formatDate(b.date) - formatDate(a.date));
      const latestDate = sortedData[0].date;
      const [latestDay, latestMonth, latestYear] = latestDate.split("-");

      resdata = sortedData
        .filter((item) => {
          const [d, m, y] = item.date.split("-");
          return m === latestMonth && y === latestYear;
        })
        .map(parseItem);
    }

    if (resdata.length === 0) {
      return res.status(404).json({ success: false, message: "No data found" });
    }

    // Sort final data descending by date
    resdata.sort((a, b) => formatDate(b.date) - formatDate(a.date));

    res.status(200).json({ success: true, resdata });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export default getFiiDiiData;
