// src/Components/Dashboard/OptionInsiderTable.jsx
import React from "react";

/**
 * Expect data: array of rows:
 * {
 *   timeStamp: "09:15 - 09:18",
 *   compareRange: "09:18 - 09:21",
 *   strikePrice: 25450,
 *   call: { text, direction, green, lastPriceNow, oiNow, lastPricePrev, oiPrev, changePrice, changeOi },
 *   put: { ... }
 * }
 */

function Badge({ analysis }) {
  if (!analysis) return null;
  const text = analysis.text || "";
  const dir = analysis.direction;
  // map text -> badge class (match your original)
  let badgeClass = "badge-interpretation ";
  if (/shorts? covering/i.test(text)) badgeClass += "badge-info";
  else if (/short build up/i.test(text)) badgeClass += "badge-danger";
  else if (/long build up/i.test(text)) badgeClass += "badge-success";
  else if (/long unwinding/i.test(text)) badgeClass += "badge-warning";
  else badgeClass += "badge-secondary";

  const iconClass = dir === "up" ? "i-Up1" : dir === "down" ? "i-Down1" : "";

  // We will render inline numeric details too
  return (
    <div className="flex flex-col items-center">
      <span className={`badge text-capitalize ${badgeClass} flex items-center px-2 py-1`}>
        {/** icon position left/right — keep sample structure */}
        {dir === "down" && <i className={`custom-icon-style i-Down1 mr-1`} />}
        <span>{text}</span>
        {dir === "up" && <i className={`custom-icon-style i-Up1 ml-1`} />}
      </span>
    </div>
  );
}

function NumericDetails({ a }) {
  if (!a) return null;
  const priceSign = a.changePrice > 0 ? "+" : "";
  const oiSign = a.changeOi > 0 ? "+" : "";
  return (
    <div className="text-xs mt-1">
      <div>Price: {a.lastPriceNow} (<span className={a.changePrice >= 0 ? "text-green-600" : "text-red-600"}>{priceSign}{a.changePrice.toFixed(2)}</span>)</div>
      <div>OI: {a.oiNow.toLocaleString()} (<span className={a.changeOi >= 0 ? "text-green-600" : "text-red-600"}>{oiSign}{a.changeOi.toLocaleString()}</span>)</div>
    </div>
  );
}

const OptionInsiderTable = ({ data = [] }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return <div className="text-sm text-gray-500">No data to show.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Time Range</th>
            <th className="p-2">Strike</th>
            <th className="p-2 text-center">Call Analysis</th>
            <th className="p-2 text-center">Call Numbers</th>
            <th className="p-2 text-center">Put Analysis</th>
            <th className="p-2 text-center">Put Numbers</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r, idx) => (
            <tr key={idx} className="border-t">
                <td className="p-2 text-xs text-gray-500">
                <div>{r.prevTimestamp} - {r.nowTimestamp}</div>
                
              </td>
              <td className="p-2 text-center font-mono">{r.strikePrice}</td>

              <td className="p-2 text-center align-top">
                <Badge analysis={r.call} />
              </td>

              <td className="p-2 text-center align-top">
                <NumericDetails a={r.call} />
              </td>

              <td className="p-2 text-center align-top">
                <Badge analysis={r.put} />
              </td>

              <td className="p-2 text-center align-top">
                <NumericDetails a={r.put} />
              </td>

            
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OptionInsiderTable;
