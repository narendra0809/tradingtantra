import FiiDiiData from "../models/FiiDiiData.model.js";

const getFiiDiiData = async (req, res) => {
  try {
    // Get the current month and year
    const currentDate = new Date();
    const currentMonth = String(currentDate.getMonth() + 1).padStart(2, "0"); // e.g., "06" for June
    const currentYear = currentDate.getFullYear(); // e.g., 2025

    // Fetch data from the database
    const data = await FiiDiiData.find({}, { _id: 0, __v: 0 }).lean();

    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: "No data found" });
    }

    // Filter data for the current month and year
    const resdata = data
      .filter((item) => {
        const [day, month, year] = item.date.split("-");
        return month === currentMonth && year === String(currentYear);
      })
      .map((item) => ({
        date: item.date,
        fii_buy: parseFloat(item.fii_buy.replace(/,/g, "")),
        fii_sell: parseFloat(item.fii_sell.replace(/,/g, "")),
        fii_net: parseFloat(item.fii_net.replace(/,/g, "")),
        dii_buy: parseFloat(item.dii_buy.replace(/,/g, "")),
        dii_sell: parseFloat(item.dii_sell.replace(/,/g, "")),
        dii_net: parseFloat(item.dii_net.replace(/,/g, "")),
        in_market: parseFloat(item.in_market?.replace(/,/g, "") || "0"), // Handle in_market field, default to 0 if missing
      }));

    // Sort data by date in descending order (newest first)
    resdata.sort((a, b) => {
      const formatDate = (d) => {
        const [dd, mm, yyyy] = d.split("-");
        return new Date(`${yyyy}-${mm}-${dd}`);
      };
      return formatDate(b.date) - formatDate(a.date);
    });

    if (resdata.length === 0) {
      return res.status(404).json({ success: false, message: `No data found for ${currentMonth}-${currentYear}` });
    }

    res.status(200).json({ success: true, resdata });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export default getFiiDiiData;