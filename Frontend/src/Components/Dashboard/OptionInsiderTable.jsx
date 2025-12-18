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
    textColor = "#FFFFFF";
    color = isDark ? "#E06666" : "#F38686";
  } else if (
    /long unwinding/i.test(putText) &&
    /short covering/i.test(callText) &&
    callDir === "up" &&
    putDir === "down"
  ) {
    text = "Bullish";
    textColor = "#FFFFFF";
    color = isDark ? "#4caf50" : "#91DD6F";
  } else if (
    /short build up/i.test(putText) &&
    /short covering/i.test(callText) &&
    callDir === "up" &&
    putDir === "down"
  ) {
    text = "Bullish";
    textColor = "#FFFFFF";
    color = isDark ? "#4caf50" : "#91DD6F";
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
    textColor = "#FFFFFF";
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
      className="flex flex-col items-center"
      style={{ backgroundColor: color, borderRadius: "16px" }}
    >
      <span className="flex items-center px-2 py-1 gap-2">
        <span
          style={{ color: textColor }}
          className="uppercase font-bold text-[10px] xs:text-[11px] sm:text-[12px] md:text-[14px]"
        >
          {text}
        </span>
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
      <FaArrowUp color={textColor} className="w-2 h-2" />
    ) : (
      <FaArrowDown color={textColor} className="w-2 h-2" />
    );

  return (
    <div
      className="flex flex-col items-center"
      style={{ backgroundColor: bgColor, borderRadius: "16px" }}
    >
      <span className="flex items-center px-2 py-1 gap-1">
        <span
          style={{ color: textColor }}
          className="uppercase text-[8px] xs:text-[9px] sm:text-[11px] md:text-[12px]"
        >
          {text}
        </span>
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
    <div className="text-[10px] xs:text-[11px] sm:text-[12px] md:text-[14px] mt-1 leading-snug">
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
    <div className="rounded-2xl w-full h-[480px] sm:h-[520px] md:h-[550px] overflow-hidden dark:bg-[linear-gradient(113.83deg,#0009B3_0.45%,#02000E_100%)] p-px">
      <div className="scrollbar-themed w-full h-full overflow-x-auto overflow-y-auto px-2 sm:px-3 md:px-5 bg-db-secondary-light dark:bg-db-secondary">
        {!isSubscribed ? (
          <Lock />
        ) : (
          <table className="min-w-full border-separate border-spacing-0 text-[10px] xs:text-[11px] sm:text-[12px] md:text-[14px]">
            <thead>
              <tr>
                <th className="sticky top-0 z-10 p-2 pt-3 pb-2 sm:pt-4 sm:pb-3 text-left bg-db-secondary-light dark:bg-db-secondary text-[10px] xs:text-[11px] sm:text-[12px] md:text-[13px]">
                  <div className="relative">
                    Time Range
                    <div
                      className={`absolute -bottom-2 left-0 right-0 h-px w-full ${
                        theme === "dark" ? "gradient-line" : "bg-gray-400"
                      }`}
                    />
                  </div>
                </th>
                <th className="sticky top-0 z-10 p-2 pt-3 pb-2 sm:pt-4 sm:pb-3 bg-db-secondary-light dark:bg-db-secondary text-[10px] xs:text-[11px] sm:text-[12px] md:text-[13px]">
                  <div className="relative">
                    Strike
                    <div
                      className={`absolute -bottom-2 left-0 right-0 h-px w-full ${
                        theme === "dark" ? "gradient-line" : "bg-gray-400"
                      }`}
                    />
                  </div>
                </th>
                <th className="sticky top-0 z-10 p-2 pt-3 pb-2 sm:pt-4 sm:pb-3 text-center bg-db-secondary-light dark:bg-db-secondary text-[10px] xs:text-[11px] sm:text-[12px] md:text-[13px]">
                  <div className="relative">
                    Call Analysis
                    <div
                      className={`absolute -bottom-2 left-0 right-0 h-px w-full ${
                        theme === "dark" ? "gradient-line" : "bg-gray-400"
                      }`}
                    />
                  </div>
                </th>
                <th className="sticky top-0 z-10 p-2 pt-3 pb-2 sm:pt-4 sm:pb-3 text-center bg-db-secondary-light dark:bg-db-secondary text-[10px] xs:text-[11px] sm:text-[12px] md:text-[13px]">
                  <div className="relative">
                    Call Numbers
                    <div
                      className={`absolute -bottom-2 left-0 right-0 h-px w-full ${
                        theme === "dark" ? "gradient-line" : "bg-gray-400"
                      }`}
                    />
                  </div>
                </th>
                <th className="sticky top-0 z-10 p-2 pt-3 pb-2 sm:pt-4 sm:pb-3 text-center bg-db-secondary-light dark:bg-db-secondary text-[10px] xs:text-[11px] sm:text-[12px] md:text-[13px]">
                  <div className="relative">
                    Overall Sentiments
                    <div
                      className={`absolute -bottom-2 left-0 right-0 h-px w-full ${
                        theme === "dark" ? "gradient-line" : "bg-gray-400"
                      }`}
                    />
                  </div>
                </th>
                <th className="sticky top-0 z-10 p-2 pt-3 pb-2 sm:pt-4 sm:pb-3 text-center bg-db-secondary-light dark:bg-db-secondary text-[10px] xs:text-[11px] sm:text-[12px] md:text-[13px]">
                  <div className="relative">
                    Put Numbers
                    <div
                      className={`absolute -bottom-2 left-0 right-0 h-px w-full ${
                        theme === "dark" ? "gradient-line" : "bg-gray-400"
                      }`}
                    />
                  </div>
                </th>
                <th className="sticky top-0 z-10 p-2 pt-3 pb-2 sm:pt-4 sm:pb-3 text-center bg-db-secondary-light dark:bg-db-secondary text-[10px] xs:text-[11px] sm:text-[12px] md:text-[13px]">
                  <div className="relative">
                    Put Analysis
                    <div
                      className={`absolute -bottom-2 left-0 right-0 h-px w-full ${
                        theme === "dark" ? "gradient-line" : "bg-gray-400"
                      }`}
                    />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((r, idx) => (
                <tr key={idx}>
                  <td className="p-2 text-[10px] xs:text-[11px] sm:text-[12px] md:text-[14px] dark:text-white whitespace-nowrap">
                    {r.prevTimestamp} - {r.nowTimestamp}
                  </td>
                  <td className="p-2 text-center text-[#0256F5] text-[10px] xs:text-[11px] sm:text-[12px] md:text-[14px] whitespace-nowrap">
                    {r.strikePrice}
                  </td>
                  <td className="p-1 sm:p-2 text-center">
                    <Badge analysis={r.call} theme={theme} />
                  </td>
                  <td className="p-1 sm:p-2 text-center align-top">
                    <NumericDetails a={r.call} />
                  </td>
                  <td className="p-1 sm:p-2 text-center">
                    <OverallSentiments data={r} theme={theme} />
                  </td>
                  <td className="p-1 sm:p-2 text-center align-top">
                    <NumericDetails a={r.put} />
                  </td>
                  <td className="p-1 sm:p-2 text-center">
                    <Badge analysis={r.put} theme={theme} />
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
