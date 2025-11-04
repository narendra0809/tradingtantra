/* eslint-disable react/prop-types */
import React, { useEffect, useState, Suspense } from "react";

// Lazy load components
const TreemapChart = React.lazy(() => import("./TreemapChart"));
const Loader = React.lazy(() => import("../Loader"));

const TreeGraphsGrid = ({ data, loading, handleGoToTable }) => {
  const graphTitles = [
    { title: "Energy", class: "div19" },
    { title: "Auto", class: "div20" },
    { title: "Nifty 50", class: "div21" },
    { title: "IT", class: "div22" },
    { title: "Reality", class: "div23" },
    { title: "Nifty Mid Select", class: "div24" },
    { title: "Cement", class: "div25" },
    { title: "Pharma", class: "div26" },
    { title: "FMCG", class: "div27" },
    { title: "PSU Bank", class: "div28" },
    { title: "Bank", class: "div29" },
    { title: "Sensex", class: "div30" },
    { title: "Metal", class: "div31" },
    { title: "Media", class: "div32" },
    { title: "Pvt Bank", class: "div33" },
    { title: "Fin Service", class: "div34" },
  ];

  const [sectorWiseData, setSectorWiseData] = useState([]);

  useEffect(() => {
    const sortedData = Object.entries(data.sectorWiseData).sort((a, b) => {
      const nameA = a[0].toLowerCase();
      const nameB = b[0].toLowerCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });
    setSectorWiseData(sortedData);
  }, [data]);

  return (
    <div className="lg:block">
      <div className="parent">
        <Suspense fallback={<div></div>}>
          {sectorWiseData.map(([sector, values], index) => (
            <div
              key={index}
              className={`${
                graphTitles[index % graphTitles.length]?.class
              } w-full h-full dark:bg-gradient-to-br dark:from-[#0009B2] dark:to-[#02000E] p-px rounded-md flex bg-gradient-to-br from-[#000006] to-[#0d0928]`}
            >
              <div className="w-full flex flex-col dark:bg-db-primary bg-primary-light rounded-md overflow-hidden">
                <button
                  className="text-left "
                  onClick={() => handleGoToTable(sector)}
                >
                  <h1 className="text-base px-2.5 py-2">{sector}</h1>
                </button>
                <div className="flex-grow w-full">
                  {loading ? (
                    <Loader />
                  ) : (
                    <TreemapChart data={values.slice(0, 10)} />
                  )}
                </div>
              </div>
            </div>
          ))}
        </Suspense>
      </div>
    </div>
  );
};

export default TreeGraphsGrid;
