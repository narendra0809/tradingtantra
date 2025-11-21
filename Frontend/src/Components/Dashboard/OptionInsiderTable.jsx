/* eslint-disable react/prop-types */
// // src/Components/Dashboard/OptionInsiderTable.jsx
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import Lock from "./Lock";

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

  const iconClass =
    dir === "up" ? (
      <FaArrowUp color={analysis.textColor} />
    ) : (
      <FaArrowDown color={analysis.textColor} />
    );

  // We will render inline numeric details too
  return (
    <div
      className={`flex flex-col items-center`}
      style={{ backgroundColor: analysis.color, borderRadius: "10px" }}
    >
      <span
        className={`badge text-capitalize ${badgeClass} flex items-center px-2 py-1 gap-2`}
      >
        {/** icon position left/right — keep sample structure */}
        {/* {dir === "down" && <i className={`custom-icon-style i-Down1 mr-1`} />} */}
        <span style={{ color: analysis.textColor }}>{text}</span>
        {iconClass}
        {/* {dir === "up" && <i className={`custom-icon-style i-Up1 ml-1`} />} */}
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
  if (!Array.isArray(data) || data.length === 0) {
    return <div className="text-sm text-gray-500">No data to show.</div>;
  }

  return (
    <div className="dark:bg-db-primary bg-primary-light rounded-lg">
      <div className="dark:bg-gradient-to-br from-[#00078F] to-[#01071C] rounded-lg">
        <div className="dark:bg-db-secondary bg-[#EEEEEE] w-full overflow-x-auto  h-[550px] overflow-y-auto rounded-lg scrollbar-hidden px-3">
          {!isSubscribed ? (
            <Lock />
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b-1 border-[#BEBFC3] dark:border-[#002ED0]">
                  <th className="p-2 text-left">Time Range</th>
                  <th className="p-2">Strike</th>
                  <th className="p-2 text-center">Call Analysis</th>
                  <th className="p-2 text-center">Call Numbers</th>
                  <th className="p-2 text-center">Put Analysis</th>
                  <th className="p-2 text-center">Put Numbers</th>
                </tr>
                <tr className="absolute bg-[#BEBEFC3] bottom-0 left-0 w-full h-[1px] bg-gradient-to-r dark:from-[#000] via-[#002ED0] dark:to-[#000] " />
              </thead>
              <tbody>
                {data.map((r, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="p-2 text-xs md:text-[16px] text-black dark:text-white">
                      <div>
                        {r.prevTimestamp} - {r.nowTimestamp}
                      </div>
                    </td>
                    <td className="p-2 text-center font-mono">
                      {r.strikePrice}
                    </td>

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
          )}
        </div>
      </div>
    </div>
  );
};

export default OptionInsiderTable;
/* src/Components/Dashboard/OptionInsiderTable.jsx */
// import React from "react";
// import Loader from "../Loader";
// import Lock from "./Lock";

// /* original small badges kept for fallback if needed */
// const upBadge = (
//   <span className="ml-2 bg-green-600 text-white px-2 py-0.5 rounded-full text-xs flex items-center w-fit">
//     <span className="mr-1">↑</span> Up
//   </span>
// );
// const downBadge = (
//   <span className="ml-2 bg-red-600 text-white px-2 py-0.5 rounded-full text-xs flex items-center w-fit">
//     <span className="mr-1">↓</span> Down
//   </span>
// );

// /**
//  * Renders the exact badge HTML you provided (keeps classes & icon placement).
//  * Expected analysis.text values (case-insensitive):
//  *  - "Shorts covering", "Short build up", "Long build up", "Long unwinding"
//  * If text doesn't match, shows a neutral badge with the text.
//  */
// function renderExactBadge(analysis = {}) {
//   const text = String(analysis?.text ?? "").trim();

//   if (/shorts? covering/i.test(text)) {
//     return (
//       <span data-v-f64ce956="">
//         <span
//           data-v-f64ce956=""
//           className="badge text-capitalize badge-interpretation text-right badge-info"
//         >
//           {" "}
//           {text} <i data-v-f64ce956="" className="custom-icon-style text-right i-Up1"></i>
//         </span>
//       </span>
//     );
//   }

//   if (/short build up/i.test(text)) {
//     return (
//       <span data-v-f64ce956="">
//         <span
//           data-v-f64ce956=""
//           className="badge text-capitalize badge-interpretation text-left badge-danger"
//         >
//           <i data-v-f64ce956="" className="custom-icon-style text-right i-Down1"></i> {text}{" "}
//         </span>
//       </span>
//     );
//   }

//   if (/long build up/i.test(text)) {
//     return (
//       <span data-v-f64ce956="">
//         <span
//           data-v-f64ce956=""
//           className="badge text-capitalize badge-interpretation text-right badge-success"
//         >
//           {text} <i data-v-f64ce956="" className="custom-icon-style text-right i-Up1"></i>
//         </span>
//       </span>
//     );
//   }

//   if (/long unwinding/i.test(text)) {
//     return (
//       <span data-v-f64ce956="">
//         <span
//           data-v-f64ce956=""
//           className="badge text-capitalize badge-interpretation text-left badge-warning"
//         >
//           <i data-v-f64ce956="" className="custom-icon-style text-right i-Down1"></i> {text}{" "}
//         </span>
//       </span>
//     );
//   }

//   // fallback neutral
//   return (
//     <span data-v-f64ce956="">
//       <span data-v-f64ce956="" className="badge text-capitalize badge-interpretation badge-secondary">
//         {text || "-"}
//       </span>
//     </span>
//   );
// }

// const OptionInsiderTable = ({ data, loading, isSubscribed }) => {
//   return (
//     <>
//       {loading ? (
//         <Loader />
//       ) : (
//         <div className="dark:bg-db-primary bg-primary-light rounded-lg p-2 ">
//           <div className="dark:bg-gradient-to-br from-[#00078F] to-[#01071C] p-px rounded-lg">
//             <div className="dark:bg-db-secondary bg-[#EEEEEE]  p-4 w-full overflow-x-auto  h-[350px] overflow-y-auto rounded-lg scrollbar-hidden">
//               {!isSubscribed ? (
//                 <Lock />
//               ) : (
//                 <table className="w-full min-w-[800px] text-sm">
//                   <thead>
//                     <tr className="border-b-1 border-[#BEBFC3] dark:border-[#002ED0]">
//                       {[
//                         "Serial No",
//                         "Time Stamp",
//                         "Call Analysis",
//                         "Strike Price",
//                         "Put Analysis",
//                       ].map((header) => (
//                         <th key={header} className="p-3 text-left whitespace-nowrap ">
//                           {header}
//                         </th>
//                       ))}
//                     </tr>
//                     <tr className="absolute bg-[#BEBEFC3] bottom-0 left-0 w-full h-[1px] bg-gradient-to-r dark:from-[#000] via-[#002ED0] dark:to-[#000] " />
//                   </thead>

//                   <tbody className="">
//                     {Array.isArray(data) && data.length > 0 ? (
//                       data.map((row, index) => {
//                         // keep API compatibility: row.call and row.put objects expected
//                         const call = row?.call || {};
//                         const put = row?.put || {};

//                         // keep original color logic for text
//                         const callTextClass = call?.green ? "text-green-500" : "text-red-500";
//                         const putTextClass = put?.green ? "text-green-500" : "text-red-500";

//                         return (
//                           <tr key={index} className="">
//                             <td className="p-3 whitespace-nowrap ">{index + 1}</td>

//                             <td className="p-3 whitespace-nowrap ">{row?.timeStamp ?? `${row?.prevTimestamp ?? ""} - ${row?.nowTimestamp ?? ""}`}</td>

//                             <td className="py-3 px-4 font-semibold">
//                               <div className="flex items-center gap-2">
//                                 <span className={callTextClass}>{call?.text ?? "-"}</span>

//                               </div>
//                             </td>

//                             <td className="p-3 whitespace-nowrap ">{row?.strikePrice ?? "-"}</td>

//                             <td className="py-3 px-4 font-semibold">
//                               <div className="flex items-center gap-2">
//                                 <span className={putTextClass}>{put?.text ?? "-"}</span>

//                               </div>
//                             </td>
//                           </tr>
//                         );
//                       })
//                     ) : (
//                       <tr>
//                         <td colSpan={5} className="p-4 text-center text-gray-500">
//                           No data to show.
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default OptionInsiderTable;
