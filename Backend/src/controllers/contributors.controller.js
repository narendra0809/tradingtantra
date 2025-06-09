import IndexCandles from "../models/indexCandles.model.js";
import MarketDetailData from "../models/marketData.model.js";
import { StocksDetail1 } from "../models/stocksDetail.model.js";

export const getIndexValue = async (indexName) => {
  try {
    const res = await IndexCandles.find({
      indexName: indexName.split(" ")[0],
      interval: "3m",
    }).sort({ updatedAt: -1 });
    return res[0].close;
  } catch (error) {
    console.log(error);
  }
};

export const getContributionInIndex = async (req, res) => {
  try {
    const indexName = req.params.indexName;

    const indexValue = await getIndexValue(indexName);

    const stocks = await StocksDetail1.find({ INDEX: { $in: indexName } });

    const stockIds = stocks.map((s) => s.SECURITY_ID);

    const marketData = await MarketDetailData.aggregate([
      { $match: { securityId: { $in: stockIds } } },
      { $sort: { date: -1 } },
      {
        $group: {
          _id: "$securityId",
          documents: { $push: "$$ROOT" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          documents: { $slice: ["$documents", 2] },
        },
      },
      { $unwind: "$documents" },
      { $replaceRoot: { newRoot: "$documents" } },
    ]);

    const contributions = stocks.map((stock) => {
      const marketDataItem = marketData.filter(
        (m) => m.securityId === stock.SECURITY_ID.toString()
      );
      //   console.log(
      //     `Market data for ${stock.toObject().SECURITY_ID} : `,
      //     marketDataItem
      //   );
      //   const latestTradedPrice = marketDataItem?.data.latestTradedPrice;
      //   const dayOpen = marketDataItem?.data.dayOpen;

      const { pts, weg } = calculatePointsContribution(
        stock.toObject(),
        marketDataItem,
        indexName,
        indexValue
      );

      return {
        symbol: stock.UNDERLYING_SYMBOL,
        displayName: stock.DISPLAY_NAME,
        points: pts,
        weg: weg,
      };
    });

    contributions.sort((a, b) => b.weg - a.weg);

    const responseData = {
      indexName,
      contributions,
    };

    res.status(200).json(responseData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const calculatePointsContribution = (
  stock,
  marketInfo,
  indexName,
  indexValue
) => {
  const currPrice = marketInfo[0].data[0].latestTradedPrice;
  const closingPrice = marketInfo[1].data[0].latestTradedPrice;

  const weg =
    stock.weightage?.find((w) => w.indexName === indexName)?.weightage || 1;

  const pts =
    (((currPrice - closingPrice) / closingPrice) * weg * indexValue) / 100;

  return { pts, weg };
};
