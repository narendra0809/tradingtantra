/* eslint-disable react/prop-types */
import { FcCandleSticks } from "react-icons/fc";
import Loader from "../Loader";
import Lock from "./Lock";


const upBadge = (
  <span className="ml-2 bg-green-600 text-white px-2 py-0.5 rounded-full text-xs flex items-center w-fit">
    <span className="mr-1">↑</span> Up
  </span>
);
const downBadge = (
  <span className="ml-2 bg-red-600 text-white px-2 py-0.5 rounded-full text-xs flex items-center w-fit">
    <span className="mr-1">↓</span> Down
  </span>
);

const OptionInsiderTable = ({ data, loading, isSubscribed }) => {
  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="dark:bg-db-primary bg-primary-light rounded-lg p-2 ">
          

          <div className="dark:bg-gradient-to-br from-[#00078F] to-[#01071C] p-px rounded-lg">
            <div className="dark:bg-db-secondary bg-[#EEEEEE]  p-4 w-full overflow-x-auto  h-[350px] overflow-y-auto rounded-lg scrollbar-hidden">
              {!isSubscribed ? (
                <Lock />
              ) : (
                <table className="w-full min-w-[800px] text-sm">
                  <thead>
                    <tr className="border-b-1 border-[#BEBFC3] dark:border-[#002ED0]">
                      {[
                        "Serial No",
                        "Time Stamp	",
                        "Call Analysis",
                        "Strike Price	",
                        "Put Analysis",
                        
                      ].map((header) => (
                        <th
                          key={header}
                          className="p-3 text-left whitespace-nowrap "
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                     <tr className="absolute bg-[#BEBEFC3] bottom-0 left-0 w-full h-[1px] bg-gradient-to-r dark:from-[#000] via-[#002ED0] dark:to-[#000] " />
                  </thead>
                  <tbody className=" ">
                    {data?.map((row, index) => (
                      <tr key={index} className="">
                        <td className="p-3 whitespace-nowrap ">
                          {index+1}
                        </td>
                        <td className="p-3 whitespace-nowrap ">
                          {row?.timeStamp}
                        </td>

                        <td className="py-3 px-4 font-semibold">
                          <div className="flex">
                            <span
                              className={
                                row.call.green
                                  ? "text-green-500"
                                  : // : row.call?.yellow
                                    // ? "text-yellow-600"
                                    "text-red-500"
                              }
                            >
                              {row.call.text}
                            </span>
                            {row.call.direction === "up" ? upBadge : downBadge}
                          </div>
                        </td>

                        <td className="p-3 whitespace-nowrap ">
                          {row?.strikePrice}
                        </td>


                         <td className="py-3 px-4 font-semibold">
                         <div className="flex">
                           <span
                             className={
                               row.put.green
                                 ? "text-green-500"
                                 : // : row.put?.yellow
                                   // ? "text-yellow-600"
                                   "text-red-500"
                             }
                           >
                             {row.put.text}
                           </span>
                           {row.put.direction === "up"
                             ? upBadge
                             : // : row.put.direction === null
                               // ? confusionBadge
                               downBadge}
                         </div>
                       </td>

                        
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OptionInsiderTable;