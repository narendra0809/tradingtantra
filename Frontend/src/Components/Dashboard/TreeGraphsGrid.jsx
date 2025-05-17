import React, { useEffect, useState, Suspense } from "react";

// Lazy load components
const TreemapChart = React.lazy(() => import("./TreemapChart"));
const Loader = React.lazy(() => import("../Loader"));

const TreeGrpahsGrid = ({ data, loading }) => {
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
  console.log('data in grapg ',data)

  useEffect(() => {
    setSectorWiseData(data.sectorWiseData);
  }, [data]);

  return (
    <>
      <div className="lg:block hidden">
        <div className="parent  ">
          <Suspense fallback={<div>Loading...</div>}>
            {Object.entries(sectorWiseData || {}).map(
              ([sector, values], index) => (
                <div
                  key={index}
                  className={`${
                    graphTitles[index % graphTitles.length]?.class
                  } w-full h-full mt-10 dark:bg-gradient-to-br from-[#0009B2] to-[#02000E] p-px rounded-md flex`}
                >
                  <div className="w-full flex flex-col dark:bg-db-primary bg-db-secondary-light rounded-md overflow-hidden">
                    <h1 className="text-base px-2.5">{sector}</h1>
                    <div className="flex-grow w-full">
                      {loading ? <Loader /> : <TreemapChart data={values.slice(0, 10)} />}
                    </div>
                  </div>
                </div>
              )
            )}
          </Suspense>
        </div>{" "}
      </div>
    </>
  );
};

export default TreeGrpahsGrid;