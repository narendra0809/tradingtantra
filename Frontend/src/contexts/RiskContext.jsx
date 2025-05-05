import React, { createContext, useContext, useState, useEffect } from "react";

const RiskContext = createContext();

export const RiskProvider = ({ children }) => {
  const [riskLevel, setRiskLevel] = useState(localStorage.getItem("riskLevel") || "Low");

  useEffect(() => {
    const updateRiskLevel = () => {
      setRiskLevel(localStorage.getItem("riskLevel") || "Low");
    };

    window.addEventListener("riskLevelUpdate", updateRiskLevel);

    return () => {
      window.removeEventListener("riskLevelUpdate", updateRiskLevel);
    };
  }, []);

  const updateRisk = (level) => {
    localStorage.setItem("riskLevel", level);
    setRiskLevel(level);
    window.dispatchEvent(new Event("riskLevelUpdate")); 
  };

  return (
    <RiskContext.Provider value={{ riskLevel, updateRisk }}>
      {children}
    </RiskContext.Provider>
  );
};

export const useRisk = () => useContext(RiskContext);
