// import IndexCandles from "../models/indexCandles.model.js";

// export const getIndexCandlesData = async (req, res) => {
//   try {
//     const now = new Date();

//     const setTime = (date, hours, minutes = 0, seconds = 0, ms = 0) => {
//       const d = new Date(date);
//       d.setHours(hours, minutes, seconds, ms);
//       return d;
//     };

//     // Helper: get a [start, end) window for a given date's trading day
//     const getTradingWindow = (date) => {
//       const start = setTime(date, 9, 15, 0, 0);
//       const nextDay = new Date(start);
//       nextDay.setDate(nextDay.getDate() + 1);
//       const end = setTime(nextDay, 9, 15, 0, 0);
//       return { start, end };
//     };

//     // Decide the "current" trading window as per your old logic
//     const today915 = setTime(now, 9, 15, 0, 0);
//     let baseDate;

//     if (now >= today915) {
//       // After 9:15 today → use today as base
//       baseDate = now;
//     } else {
//       // Before 9:15 today → use yesterday as base
//       const yesterday = new Date(now);
//       yesterday.setDate(yesterday.getDate() - 1);
//       baseDate = yesterday;
//     }

//     let { start, end } = getTradingWindow(baseDate);

//     // First, try to fetch candles for the "current" window
//     let candles = await IndexCandles.find({
//       updatedAt: { $gte: start, $lt: end },
//     }).sort({ updatedAt: 1 });

//     // If nothing found (weekend / holiday / no data), fall back to last working day
//     if (!candles || candles.length === 0) {
//       // Find the latest candle strictly before the current window start
//       const lastCandle = await IndexCandles.findOne({
//         updatedAt: { $lt: start },
//       }).sort({ updatedAt: -1 });

//       if (!lastCandle) {
//         return res
//           .status(404)
//           .send("No index candles found for any previous trading day");
//       }

//       // Use that candle's trading day as the fallback window
//       const { start: fallbackStart, end: fallbackEnd } = getTradingWindow(
//         lastCandle.updatedAt
//       );

//       candles = await IndexCandles.find({
//         updatedAt: { $gte: fallbackStart, $lt: fallbackEnd },
//       }).sort({ updatedAt: 1 });

//       if (!candles || candles.length === 0) {
//         // Very unlikely: we found a lastCandle but can't fetch its day's range
//         return res
//           .status(404)
//           .send("No index candles found for last working day");
//       }
//     }

//     return res.status(200).send(candles);
//   } catch (error) {
//     console.log("Error while fetching index candles : ", error);
//     return res.status(500).send("internal server error");
//   }
// };


import IndexCandles from "../models/indexCandles.model.js";

export const getIndexCandlesData = async (req, res) => {
  try {
    const now = new Date();

    const setTime = (date, hours, minutes = 0, seconds = 0, ms = 0) => {
      const d = new Date(date);
      d.setHours(hours, minutes, seconds, ms);
      return d;
    };

    // Helper: get a [start, end) window for a given date's trading day
    const getTradingWindow = (date) => {
      const start = setTime(date, 9, 15, 0, 0); // 9:15 AM
      const nextDay = new Date(start);
      nextDay.setDate(nextDay.getDate() + 1);
      const end = setTime(nextDay, 9, 15, 0, 0); // next day 9:15 AM
      return { start, end };
    };

    // Decide the "current" trading window as per your old logic
    const today915 = setTime(now, 9, 15, 0, 0);
    let baseDate;

    if (now >= today915) {
      // After 9:15 today → use today as base
      baseDate = now;
    } else {
      // Before 9:15 today → use yesterday as base
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      baseDate = yesterday;
    }

    let { start, end } = getTradingWindow(baseDate);

    // First, try to fetch candles for the "current" window (only 3m)
    let candles = await IndexCandles.find({
      updatedAt: { $gte: start, $lt: end },
      interval: "3m",
    }).sort({ updatedAt: 1 });

    // If nothing found (weekend / holiday / no data), fall back to last working day
    if (!candles || candles.length === 0) {
      const lastCandle = await IndexCandles.findOne({
        updatedAt: { $lt: start },
        interval: "3m",
      }).sort({ updatedAt: -1 });

      if (!lastCandle) {
        return res
          .status(404)
          .send("No index candles found for any previous trading day");
      }

      const {
        start: fallbackStart,
        end: fallbackEnd,
      } = getTradingWindow(lastCandle.updatedAt);

      candles = await IndexCandles.find({
        updatedAt: { $gte: fallbackStart, $lt: fallbackEnd },
        interval: "3m",
      }).sort({ updatedAt: 1 });

      if (!candles || candles.length === 0) {
        return res
          .status(404)
          .send("No index candles found for last working day");
      }
    }

    // ------------ AGGREGATION PART ------------

    // "05/12/2025, 09:15:00 AM" -> { hour: 9, minute: 15 }
    const parseHourMinuteFromTimestamp = (timestamp) => {
      if (!timestamp || typeof timestamp !== "string") return null;

      const parts = timestamp.split(", "); // ["05/12/2025", "09:15:00 AM"]
      if (parts.length < 2) return null;

      const timePart = parts[1]; // "09:15:00 AM"
      const [hms, ampm] = timePart.split(" ");
      if (!hms || !ampm) return null;

      const [hStr, mStr] = hms.split(":");
      let hour = parseInt(hStr, 10);
      const minute = parseInt(mStr, 10);

      if (ampm === "PM" && hour !== 12) hour += 12;
      if (ampm === "AM" && hour === 12) hour = 0;

      return { hour, minute };
    };

    /**
     * 3m -> frameMinutes (15m / 30m), per indexName + securityId
     *  - Trading start: 9:15 (fixed)
     *  - 9:15 first bucket for both 15m & 30m
     *  - Last 30m bucket starting at 15:15 → 3:15 & 3:30 candles only (15 min data)
     */
    const aggregateCandles = (candles3m, frameMinutes) => {
      const resultMap = new Map();
      const tradingStartMinutes = 9 * 60 + 15; // 9:15 = 555

      for (const candle of candles3m) {
        const hm = parseHourMinuteFromTimestamp(candle.timestamp);
        if (!hm) continue;

        const totalMinutes = hm.hour * 60 + hm.minute;
        const diff = totalMinutes - tradingStartMinutes;
        if (diff < 0) continue; // before 9:15, ignore

        const bucketIndex = Math.floor(diff / frameMinutes);
        const bucketStartTotalMinutes =
          tradingStartMinutes + bucketIndex * frameMinutes;

        const bucketHour = Math.floor(bucketStartTotalMinutes / 60);
        const bucketMinute = bucketStartTotalMinutes % 60;
        const bucketTimeKey = `${String(bucketHour).padStart(2, "0")}:${String(
          bucketMinute
        ).padStart(2, "0")}`;

        // 👉 Key includes indexName + securityId + time
        const symbolKey = `${candle.indexName}-${candle.securityId}-${bucketTimeKey}`;

        let agg = resultMap.get(symbolKey);
        if (!agg) {
          // First candle in this bucket for THIS index
          agg = {
            indexName: candle.indexName,
            securityId: candle.securityId,
            interval: `${frameMinutes}m`,
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close,
            timestamp: candle.timestamp, // first candle timestamp
            createdAt: candle.createdAt,
            updatedAt: candle.updatedAt,
            _bucketTimeSort: bucketStartTotalMinutes, // for sorting
          };
          resultMap.set(symbolKey, agg);
        } else {
          // Update OHLC on every new candle of this bucket
          agg.high = Math.max(agg.high, candle.high);
          agg.low = Math.min(agg.low, candle.low);
          agg.close = candle.close; // last candle close
          agg.updatedAt = candle.updatedAt; // last candle time
        }
      }

      // Convert Map to array and sort by _bucketTimeSort
      const result = Array.from(resultMap.values())
        .sort((a, b) => a._bucketTimeSort - b._bucketTimeSort)
        .map(({ _bucketTimeSort, ...rest }) => rest); // remove internal field

      return result;
    };

    const candles3m = candles; // from DB
    const candles15m = aggregateCandles(candles3m, 15);
    const candles30m = aggregateCandles(candles3m, 30);

    console.log("Fetched index candles count (3m): ", candles3m.length);
    console.log("Aggregated 15m candles count: ", candles15m.length);
    console.log("Aggregated 30m candles count: ", candles30m.length);

    // FINAL RESPONSE: flat array (3m + 15m + 30m)
    const allCandles = [
      ...candles3m, // interval: "3m"
      ...candles15m, // interval: "15m"
      ...candles30m, // interval: "30m"
    ];

    return res.status(200).json(allCandles);
  } catch (error) {
    console.log("Error while fetching index candles : ", error);
    return res.status(500).send("internal server error");
  }
};
