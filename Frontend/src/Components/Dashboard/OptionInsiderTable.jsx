/* eslint-disable react/prop-types */
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import Lock from "./Lock";
import { useSelector } from "react-redux";

function OverallSentiments({ data, theme }) {
  if (!data) return null;
  const put = data.put;
  const call = data.call;
  const putText = put.text;
  const callText = call.text;
  const putDir = put.direction;
  const callDir = call.direction;
  const isDark = theme === "dark";
  let text = "";
  let textColor = "";
  let color = "";
  // let badgeClass = "badge-interpretation ";
  if (/short covering/i.test(putText) && /short covering/i.test(callText)) {
    text = "Neutral";
    textColor = "#000A2D";
    color = isDark ? "#EAEA50" : "#EAEA3B";
  } else if (
    /long build up/i.test(putText) &&
    /long build up/i.test(callText)
  ) {
    text = "Confusion";
    textColor = "#FFFFFF";
    color = isDark ? "#0000FF" : "#0000FF";
  } else if (
    /long unwinding/i.test(putText) &&
    /long unwinding/i.test(callText)
  ) {
    text = "Neutral";
    textColor = "#000A2D";
    color = isDark ? "#EAEA50" : "#EAEA3B";
  } else if (
    /short covering/i.test(putText) &&
    /long build up/i.test(callText) &&
    callDir === "up" &&
    putDir === "up"
  ) {
    text = "Strong Bullish";
    textColor = "#FFFFFF";
    color = isDark ? "#38761D" : "#5A993E";
  } else if (
    /long unwinding/i.test(putText) &&
    /long build up/i.test(callText) &&
    callDir === "up" &&
    putDir === "down"
  ) {
    text = "Strong Bullish";
    textColor = "#FFFFFF";
    color = isDark ? "#38761D" : "#5A993E";
  } else if (
    /short build up/i.test(putText) &&
    /long build up/i.test(callText) &&
    callDir === "up" &&
    putDir === "down"
  ) {
    text = "Strong Bullish";
    textColor = "#FFFFFF";
    color = isDark ? "#38761D" : "#5A993E";
  } else if (
    /long build up/i.test(putText) &&
    /short covering/i.test(callText) &&
    callDir === "up" &&
    putDir === "up"
  ) {
    text = "Moderate Bearish";
    textColor = "#000A2D";
    color = isDark ? "#E06666" : "#F38686";
  } else if (
    /long unwinding/i.test(putText) &&
    /short covering/i.test(callText) &&
    callDir === "up" &&
    putDir === "down"
  ) {
    text = "Bullish";
    textColor = "#000A2D";
    color = isDark ? "#93C47D" : "#91DD6F";
  } else if (
    /short build up/i.test(putText) &&
    /short covering/i.test(callText) &&
    callDir === "up" &&
    putDir === "down"
  ) {
    text = "Bullish";
    textColor = "#000A2D";
    color = isDark ? "#93C47D" : "#91DD6F";
  } else if (
    /long build up/i.test(putText) &&
    /long unwinding/i.test(callText) &&
    callDir === "down" &&
    putDir === "up"
  ) {
    text = "Strong Bearish";
    textColor = "#FFFFFF";
    color = isDark ? "#CC0000" : "#D62B2B";
  } else if (
    /short covering/i.test(putText) &&
    /long unwinding/i.test(callText) &&
    callDir === "down" &&
    putDir === "up"
  ) {
    text = "Bearish";
    textColor = "#FFFFFF";
    color = isDark ? "#e06666" : "#D62B2B";
  } else if (
    /short build up/i.test(putText) &&
    /long unwinding/i.test(callText) &&
    callDir === "down" &&
    putDir === "down"
  ) {
    text = "Range-bound";
    textColor = "#FFFFFF";
    color = isDark ? "#1155CC" : "#1155CC";
  } else if (
    /long build up/i.test(putText) &&
    /short build up/i.test(callText) &&
    callDir === "down" &&
    putDir === "up"
  ) {
    text = "Strong Bearish";
    textColor = "#FFFFFF";
    color = isDark ? "#CC0000" : "#D62B2B";
  } else if (
    /short covering/i.test(putText) &&
    /short build up/i.test(callText) &&
    callDir === "down" &&
    putDir === "up"
  ) {
    text = "Moderate Bearish";
    textColor = "#000A2D";
    color = isDark ? "#E06666" : "#F38686";
  } else if (
    /long unwinding/i.test(putText) &&
    /short build up/i.test(callText) &&
    callDir === "down" &&
    putDir === "down"
  ) {
    text = "Neutral";
    textColor = "#000A2D";
    color = isDark ? "#EAEA50" : "#EAEA3B";
  } else if (
    /short build up/i.test(putText) &&
    /short build up/i.test(callText)
  ) {
    text = "Confusion";
    textColor = "#FFFFFF";
    color = isDark ? "#0000FF" : "#0000FF";
  }

  return (
    <div
      className={`flex flex-col items-center`}
      style={{ backgroundColor: color, borderRadius: "20px" }}
    >
      <span className={`text-capitalize flex items-center px-2 py-2 gap-2`}>
        <span style={{ color: textColor }}>{text}</span>
      </span>
    </div>
  );
}

function Badge({ analysis, theme }) {
  if (!analysis) return null;
  const text = analysis.text || "";
  const dir = analysis.direction;
  const isDark = theme === "dark";

  let bgColor = "";
  let textColor = "#FFFFFF";
  if (/shorts? covering/i.test(text)) {
    bgColor = isDark ? "#003473" : "#407EC9";
  } else if (/short build up/i.test(text)) {
    bgColor = isDark ? "#F44336" : "#EF5145";
  } else if (/long build up/i.test(text)) {
    bgColor = isDark ? "#4CAF50" : "#6AC06E";
  } else if (/long unwinding/i.test(text)) {
    bgColor = isDark ? "#E9B10B" : "#F2CC5D";
    textColor = "#000A2D";
  }

  const iconClass =
    dir === "up" ? (
      <FaArrowUp color={textColor} />
    ) : (
      <FaArrowDown color={textColor} />
    );

  return (
    <div
      className={`flex flex-col items-center`}
      style={{ backgroundColor: bgColor, borderRadius: "20px" }}
    >
      <span
        className={`badge text-capitalize flex items-center px-2 py-2 gap-2`}
      >
        <span style={{ color: textColor }}>{text}</span>
        {iconClass}
      </span>
    </div>
  );
}

function NumericDetails({ a }) {
  if (!a) return null;
  const priceSign = a.changePrice > 0 ? "+" : "";
  const oiSign = a.changeOi > 0 ? "+" : "";
  return (
    <div className="md:text-[16px] text-xs mt-1">
      <div>
        Price: {a.lastPriceNow} (
        <span
          className={a.changePrice >= 0 ? "text-green-600" : "text-red-600"}
        >
          {priceSign}
          {a.changePrice.toFixed(2)}
        </span>
        )
      </div>
      <div>
        OI: {a.oiNow.toLocaleString()} (
        <span className={a.changeOi >= 0 ? "text-green-600" : "text-red-600"}>
          {oiSign}
          {a.changeOi.toLocaleString()}
        </span>
        )
      </div>
    </div>
  );
}

const OptionInsiderTable = ({ data = [], isSubscribed }) => {
  const theme = useSelector((state) => state.theme.theme);

  if (!Array.isArray(data) || data.length === 0) {
    return <div className="text-sm text-gray-500">No data to show.</div>;
  }
  return (
    <div className="rounded-2xl w-full h-[550px] overflow-hidden dark:gradient-box p-px">
      <div className="w-full h-full overflow-x-auto overflow-y-auto scrollbar-hidden px-5 pt-5 bg-db-secondary-light dark:bg-db-secondary">
        {!isSubscribed ? (
          <Lock />
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className="p-2 text-left">Time Range</th>
                <th className="p-2 text-center">Call Analysis</th>
                <th className="p-2 text-center">Call Numbers</th>
                <th className="p-2">Strike</th>
                <th className="p-2 text-center">Overall Sentiments</th>
                <th className="p-2 text-center">Put Analysis</th>
                <th className="p-2 text-center">Put Numbers</th>
              </tr>
              <tr>
                <td colSpan={7} className="p-0">
                  <div className="h-px w-full gradient-line my-5" />
                </td>
              </tr>
            </thead>
            <tbody>
              {data.map((r, idx) => (
                <tr key={idx}>
                  <td className="p-2 text-xs md:text-[16px] dark:text-white">
                    {r.prevTimestamp} - {r.nowTimestamp}
                  </td>
                  <td className="p-2 text-center">
                    <Badge analysis={r.call} theme={theme} />
                  </td>
                  <td className="p-2 text-center">
                    <NumericDetails a={r.call} />
                  </td>
                  <td className="p-2 text-center font-mono text-[#0256F5]">
                    {r.strikePrice}
                  </td>
                  <td className="p-2 text-center font-mono">
                    <OverallSentiments data={r} theme={theme} />
                  </td>
                  <td className="p-2 text-center align-top">
                    <Badge analysis={r.put} theme={theme} />
                  </td>
                  <td className="p-2 text-center align-top">
                    <NumericDetails a={r.put} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default OptionInsiderTable;
